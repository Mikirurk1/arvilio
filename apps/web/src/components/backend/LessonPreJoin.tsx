'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Button } from '../ui';
import styles from './LessonPreJoin.module.scss';

export type PreJoinChoices = {
  audioEnabled: boolean;
  videoEnabled: boolean;
  audioDeviceId: string;
  videoDeviceId: string;
};

type Props = {
  displayName: string;
  onSubmit: (choices: PreJoinChoices) => void;
};

export function LessonPreJoin({ displayName, onSubmit }: Props) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Defer getUserMedia to the next tick so the component renders first.
  // Camera/mic init can stall the browser for several seconds on some systems.
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    timer = setTimeout(() => {
      if (!active) return;
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setMediaReady(true);
        })
        .catch((err) => {
          console.warn('[PreJoin]', err);
          setMediaReady(true); // still allow joining without camera
        });
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const handleJoin = () => {
    const stream = streamRef.current;
    const videoTrack = stream?.getVideoTracks()[0];
    const audioTrack = stream?.getAudioTracks()[0];
    onSubmit({
      audioEnabled,
      videoEnabled,
      audioDeviceId: audioTrack?.getSettings().deviceId ?? '',
      videoDeviceId: videoTrack?.getSettings().deviceId ?? '',
    });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.preview}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={styles.video}
          style={{ display: mediaReady && videoEnabled ? 'block' : 'none' }}
        />
        {(!mediaReady || !videoEnabled) && (
          <div className={styles.noCamera}>
            {!mediaReady ? (
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Starting camera…</span>
            ) : (
              <VideoOff size={40} />
            )}
          </div>
        )}
        <div className={styles.name}>{displayName}</div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={`${styles.btn} ${!audioEnabled ? styles.off : ''}`}
          title={audioEnabled ? 'Mute mic' : 'Unmute mic'}
          onClick={() => setAudioEnabled((v) => !v)}
        >
          {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        <button
          type="button"
          className={`${styles.btn} ${!videoEnabled ? styles.off : ''}`}
          title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          onClick={() => setVideoEnabled((v) => !v)}
        >
          {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
        </button>
      </div>

      <Button className={styles.join} onClick={handleJoin}>
        Join
      </Button>
    </div>
  );
}
