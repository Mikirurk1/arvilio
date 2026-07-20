'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpeakingTopicCardDto } from '@pkg/types';
import { Mic, PauseCircle, PlayCircle, RotateCcw, Square, Upload } from 'lucide-react';
import { Button, SurfaceCard } from '../../components/ui';
import { useAuth } from '../../lib/auth-context';
import { useCampusT } from '../../lib/cms';
import { usePracticeSessionTracker } from '../../lib/practice-session-tracker';
import { speakingSubmissionAudioHref, uploadSpeakingSubmissionAudio } from '../../lib/speaking-upload';
import { useSpeakingStore } from '../../stores/speaking-store';
import styles from './SpeakingRecordSession.module.scss';

type Props = {
  topic: SpeakingTopicCardDto;
  onDone?: () => void;
  onCancel?: () => void;
  /** When true renders without SurfaceCard wrapper (for inline use inside another card). */
  embedded?: boolean;
};

type Phase = 'idle' | 'recording' | 'preview' | 'uploading' | 'done';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function SpeakingRecordSession({ topic, onDone, onCancel, embedded = false }: Props) {
  const t = useCampusT();
  const { user } = useAuth();
  const submitRecording = useSpeakingStore((s) => s.submitRecording);
  const fetchMyTopics = useSpeakingStore((s) => s.fetchMyTopics);

  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const blobRef = useRef<Blob | null>(null);

  // Spectrogram refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Custom player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playerPlaying, setPlayerPlaying] = useState(false);
  const [playerTime, setPlayerTime] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);

  usePracticeSessionTracker(user?.id, 'speaking', phase === 'recording', { idleTimeoutMs: false });

  // Elapsed timer during recording
  useEffect(() => {
    if (phase !== 'recording' || startedAtRef.current === null) return;
    const timer = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAtRef.current!) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      stopSpectrogram();
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  // ─── Spectrogram ───────────────────────────────────────────────────

  const stopSpectrogram = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio ?? 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
    if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    analyser.getByteFrequencyData(data);

    ctx.clearRect(0, 0, w, h);

    const barCount = Math.min(bufLen, 80);
    const barW = w / barCount - 1;

    for (let i = 0; i < barCount; i++) {
      const v = (data[i] ?? 0) / 255;
      const barH = v * h;
      const hue = 185 + v * 40;
      const light = 42 + v * 24;
      ctx.fillStyle = `hsl(${hue}, 72%, ${light}%)`;
      ctx.beginPath();
      ctx.roundRect(i * (barW + 1), h - barH, barW, barH, 2);
      ctx.fill();
    }

    animFrameRef.current = requestAnimationFrame(drawFrame);
  }, []);

  const startSpectrogram = useCallback(
    (stream: MediaStream) => {
      const AudioContext = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyserRef.current = analyser;
      drawFrame();
    },
    [drawFrame],
  );

  // ─── Recording ─────────────────────────────────────────────────────

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      startSpectrogram(stream);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        stopStream();
        stopSpectrogram();
        setPhase('preview');
        setPlayerTime(0);
        setPlayerDuration(0);
      };
      recorder.start();
      startedAtRef.current = Date.now();
      setElapsedSec(0);
      setPhase('recording');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('speaking.session.micDenied'));
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  };

  const resetRecording = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    blobRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = null;
    setElapsedSec(0);
    setPlayerPlaying(false);
    setPlayerTime(0);
    setPlayerDuration(0);
    setPhase('idle');
  };

  const uploadRecording = async () => {
    const blob = blobRef.current;
    if (!blob || !topic.assignment) return;
    setPhase('uploading');
    setError(null);
    try {
      const submission = await submitRecording({
        topicId: topic.id,
        assignmentId: topic.assignment.id,
        durationSec: elapsedSec,
      });
      await uploadSpeakingSubmissionAudio(submission.id, blob);
      setSubmissionId(submission.id);
      await fetchMyTopics(true);
      setPhase('done');
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('speaking.session.uploadFailed'));
      setPhase('preview');
    }
  };

  // ─── Custom player ─────────────────────────────────────────────────

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playerPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const t = Number(e.target.value);
    setPlayerTime(t);
    if (audio) audio.currentTime = t;
  };

  const playerSrc = phase === 'done' && submissionId
    ? speakingSubmissionAudioHref(submissionId)
    : previewUrl ?? undefined;

  const showPlayer = (phase === 'preview' || phase === 'done') && playerSrc;

  // ─── Render ────────────────────────────────────────────────────────

  const Wrapper = embedded ? 'div' : SurfaceCard;

  return (
    <Wrapper className={styles.card}>
      <div className={styles.head}>
        <div className={`${styles.micDot} ${phase === 'recording' ? styles.micDotActive : ''}`} aria-hidden>
          <Mic size={15} />
        </div>
        <div className={styles.headText}>
          <span className={styles.title}>
            {phase === 'idle' && t('speaking.session.ready')}
            {phase === 'recording' && t('speaking.session.recording')}
            {phase === 'preview' && t('speaking.session.preview')}
            {phase === 'uploading' && t('speaking.session.uploading')}
            {phase === 'done' && t('speaking.session.submitted')}
          </span>
          <span className={styles.timer} aria-live="polite">{formatTime(elapsedSec)}</span>
        </div>
      </div>

      {/* Live spectrogram — visible during recording */}
      <div
        className={styles.spectrogramWrap}
        aria-hidden
        style={{ display: phase === 'recording' ? undefined : 'none' }}
      >
        <canvas ref={canvasRef} className={styles.spectrogram} />
      </div>

      {/* Custom audio player */}
      {showPlayer ? (
        <>
          {/* Hidden native audio element drives the player state */}
          <audio
            ref={audioRef}
            src={playerSrc}
            onPlay={() => setPlayerPlaying(true)}
            onPause={() => setPlayerPlaying(false)}
            onEnded={() => { setPlayerPlaying(false); setPlayerTime(0); }}
            onTimeUpdate={() => setPlayerTime(audioRef.current?.currentTime ?? 0)}
            onLoadedMetadata={() => setPlayerDuration(audioRef.current?.duration ?? 0)}
            style={{ display: 'none' }}
          >
            <track kind="captions" />
          </audio>

          <div className={styles.playerControls}>
            <Button
              variant="bare"
              type="button"
              className={styles.playerBtn}
              onClick={togglePlay}
              aria-label={playerPlaying ? t('speaking.session.pause') : t('speaking.session.play')}
            >
              {playerPlaying
                ? <PauseCircle size={22} aria-hidden />
                : <PlayCircle size={22} aria-hidden />}
            </Button>
            <div className={styles.playerTrack}>
              <input
                type="range"
                className={styles.playerProgress}
                min={0}
                max={playerDuration || 1}
                step={0.01}
                value={playerTime}
                onChange={handleSeek}
                aria-label={t('speaking.session.playbackPosition')}
              />
            </div>
            <span className={styles.playerTime} aria-live="polite">
              {formatTime(Math.floor(playerTime))}&nbsp;/&nbsp;{formatTime(Math.floor(playerDuration))}
            </span>
          </div>
        </>
      ) : null}

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        {phase === 'idle' ? (
          <>
            <Button type="button" onClick={() => void startRecording()}>
              <Mic size={16} aria-hidden />
              {t('speaking.session.start')}
            </Button>
            {onCancel ? (
              <Button type="button" variant="ghost" onClick={onCancel}>
                {t('speaking.cancel')}
              </Button>
            ) : null}
          </>
        ) : null}

        {phase === 'recording' ? (
          <Button type="button" variant="default" onClick={stopRecording}>
            <Square size={14} aria-hidden />
            {t('speaking.session.stop')}
          </Button>
        ) : null}

        {phase === 'preview' ? (
          <>
            <Button
              type="button"
              variant="primary"
              onClick={() => void uploadRecording()}
              disabled={elapsedSec < 1}
            >
              <Upload size={16} aria-hidden />
              {t('speaking.session.submit')}
            </Button>
            <Button type="button" variant="ghost" onClick={resetRecording}>
              <RotateCcw size={14} aria-hidden />
              {t('speaking.reRecord')}
            </Button>
          </>
        ) : null}

        {phase === 'uploading' ? (
          <Button disabled>{t('speaking.session.uploading')}</Button>
        ) : null}

        {phase === 'done' ? (
          <Button type="button" variant="default" onClick={onCancel ?? onDone}>
            {t('speaking.session.done')}
          </Button>
        ) : null}
      </div>
    </Wrapper>
  );
}
