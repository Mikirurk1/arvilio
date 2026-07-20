'use client';

import { useRef, useState } from 'react';
import { PauseCircle, PlayCircle } from 'lucide-react';
import { Button } from '../../components/ui';
import styles from './AudioPlayer.module.scss';

type Props = {
  src: string;
  className?: string;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function AudioPlayer({ src, className }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      void el.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  return (
    <div className={[styles.player, className].filter(Boolean).join(' ')}>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        style={{ display: 'none' }}
      >
        <track kind="captions" />
      </audio>

      <Button
        variant="bare"
        type="button"
        className={styles.playBtn}
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing
          ? <PauseCircle size={20} aria-hidden />
          : <PlayCircle size={20} aria-hidden />}
      </Button>

      <div className={styles.track}>
        <input
          type="range"
          className={styles.progress}
          min={0}
          max={duration || 1}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          aria-label="Playback position"
        />
      </div>

      <span className={styles.time} aria-live="polite">
        {formatTime(Math.floor(currentTime))}&nbsp;/&nbsp;{formatTime(Math.floor(duration))}
      </span>
    </div>
  );
}
