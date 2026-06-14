'use client';

import { useEffect, useRef, useState } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { LessonPreJoin, type PreJoinChoices } from './LessonPreJoin';
import { VideoRoom } from './LessonVideoRoom';
import styles from './backend-panels.module.scss';

type Props = {
  lessonBackendId: string;
};

type TokenResponse = {
  wsUrl: string;
  token: string;
  roomName: string;
};

export function LessonVideoEmbed({ lessonBackendId }: Props) {
  const displayName = useAuthStore((s) => s.user?.displayName ?? s.user?.email ?? '');
  const [auth, setAuth] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [choices, setChoices] = useState<PreJoinChoices | null>(null);
  const [tokenKey, setTokenKey] = useState(0); // bump to re-fetch token
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setAuth(null);
    setError(null);
    void (async () => {
      try {
        const data = await apiClient.get<TokenResponse>(
          `/lessons/scheduled/${encodeURIComponent(lessonBackendId)}/livekit-token`,
        );
        if (!cancelled) setAuth(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Connection failed');
      }
    })();
    return () => { cancelled = true; };
  }, [lessonBackendId, tokenKey]);

  if (error) {
    return (
      <div className={styles.videoEmbedFrame} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 }}>
        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, textAlign: 'center', fontSize: 15 }}>{error}</p>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className={styles.videoEmbedFrame} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#fff', margin: 0 }}>Connecting to lesson room…</p>
      </div>
    );
  }

  if (!choices) {
    return (
      <div className={styles.videoEmbedFrame}>
        <LessonPreJoin displayName={displayName} onSubmit={setChoices} />
      </div>
    );
  }

  return (
    <div className={styles.videoEmbedFrame} ref={containerRef}>
      <LiveKitRoom
        token={auth.token}
        serverUrl={auth.wsUrl}
        connect
        audio={choices.audioEnabled}
        video={choices.videoEnabled}
        data-lk-theme="default"
        style={{ height: '100%' }}
        onDisconnected={() => {
          setChoices(null);
          setTokenKey((k) => k + 1); // re-fetch a fresh token on rejoin
        }}
        onError={(err) => console.error('[LiveKit]', err)}
      >
        <VideoRoom containerRef={containerRef} />
      </LiveKitRoom>
    </div>
  );
}
