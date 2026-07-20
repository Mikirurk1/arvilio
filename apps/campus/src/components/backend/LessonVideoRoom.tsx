'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  CarouselLayout,
  DisconnectButton,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  MediaDeviceMenu,
  ParticipantTile,
  RoomAudioRenderer,
  isTrackReference,
  useConnectionState,
  useCreateLayoutContext,
  useLocalParticipantPermissions,
  usePinnedTracks,
  useTrackToggle,
  useTracks,
} from '@livekit/components-react';
import { ConnectionState, Track } from 'livekit-client';
import {
  Maximize,
  Mic,
  MicOff,
  Minimize,
  Monitor,
  PhoneOff,
  PictureInPicture2,
  Video,
  VideoOff,
} from 'lucide-react';
import { Button } from '../ui';
import styles from './LessonVideoRoom.module.scss';

function MicButton() {
  const { buttonProps, enabled } = useTrackToggle({ source: Track.Source.Microphone });
  return (
    <Button variant="bare" {...buttonProps} className={`${styles.btn} ${!enabled ? styles.toggled : ''}`} title={enabled ? 'Mute mic' : 'Unmute mic'}>
      {enabled ? <Mic size={18} /> : <MicOff size={18} />}
    </Button>
  );
}

function CameraButton() {
  const { buttonProps, enabled } = useTrackToggle({ source: Track.Source.Camera });
  return (
    <Button variant="bare" {...buttonProps} className={`${styles.btn} ${!enabled ? styles.toggled : ''}`} title={enabled ? 'Turn off camera' : 'Turn on camera'}>
      {enabled ? <Video size={18} /> : <VideoOff size={18} />}
    </Button>
  );
}

function ScreenShareButton() {
  const { buttonProps, enabled } = useTrackToggle({ source: Track.Source.ScreenShare });
  return (
    <Button variant="bare" {...buttonProps} className={`${styles.btn} ${enabled ? styles.screenActive : ''}`} title={enabled ? 'Stop sharing' : 'Share screen'}>
      <Monitor size={18} />
    </Button>
  );
}

type ControlBarProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  pipCanvasRef: React.RefObject<HTMLCanvasElement | null>;
};

function ControlBar({ containerRef, pipCanvasRef }: ControlBarProps) {
  const perms = useLocalParticipantPermissions();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  }, [containerRef]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const enterPip = useCallback(async () => {
    const canvas = pipCanvasRef.current;
    if (!canvas) return;

    // Canvas stream → hidden video → PiP
    const stream = (canvas as HTMLCanvasElement & { captureStream(fps?: number): MediaStream }).captureStream(15);
    let vid = pipVideoRef.current;
    if (!vid) {
      vid = document.createElement('video');
      vid.muted = true;
      vid.style.display = 'none';
      document.body.appendChild(vid);
      pipVideoRef.current = vid;
    }
    vid.srcObject = stream;
    await vid.play();
    await vid.requestPictureInPicture();
    setPipActive(true);
    vid.addEventListener('leavepictureinpicture', () => setPipActive(false), { once: true });
  }, [pipCanvasRef]);

  const togglePip = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPipActive(false);
      } else {
        await enterPip();
      }
    } catch {
      // PiP not supported or denied
    }
  }, [enterPip]);

  // Auto-PiP when tab hidden
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && !document.pictureInPictureElement) void togglePip();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [togglePip]);

  // Cleanup hidden video on unmount
  useEffect(() => {
    return () => {
      const vid = pipVideoRef.current;
      if (vid) {
        vid.srcObject = null;
        vid.remove();
        pipVideoRef.current = null;
      }
    };
  }, []);

  const canPublish = perms?.canPublish ?? false;
  const canScreenShare =
    canPublish &&
    (!perms?.canPublishSources?.length ||
      perms.canPublishSources.includes(Track.Source.ScreenShare as unknown as never));

  return (
    <div className={styles.controlBar}>
      {canPublish && (
        <>
          <div className={styles.btnGroup}>
            <MicButton />
            <MediaDeviceMenu kind="audioinput" className={styles.menuBtn} />
          </div>

          <div className={styles.btnGroup}>
            <CameraButton />
            <MediaDeviceMenu kind="videoinput" className={styles.menuBtn} />
          </div>

          {canScreenShare && <ScreenShareButton />}
        </>
      )}

      <Button
        variant="bare"
        type="button"
        className={`${styles.btn} ${pipActive ? styles.active : ''}`}
        title={pipActive ? 'Exit picture-in-picture' : 'Picture-in-picture'}
        onClick={() => void togglePip()}
      >
        <PictureInPicture2 size={18} />
      </Button>

      <Button
        variant="bare"
        type="button"
        className={styles.btn}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </Button>

      <DisconnectButton className={`${styles.btn} ${styles.leave}`} title="Leave">
        <PhoneOff size={18} />
      </DisconnectButton>
    </div>
  );
}

// Draws all participant videos onto the PiP canvas:
// - Screen share (if any) fills top portion, cameras strip at bottom
// - Active speaker gets a subtle highlight border
// - Pure grid when no screen share
function drawPipCanvas(canvas: HTMLCanvasElement, container: HTMLElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  ctx.fillStyle = '#0d0d14';
  ctx.fillRect(0, 0, W, H);

  const screenShareEl = container.querySelector<HTMLVideoElement>(
    '[data-lk-source="screen_share"] video',
  );

  const allVideos = Array.from(container.querySelectorAll<HTMLVideoElement>('video')).filter(
    (v) => !v.paused && v.readyState >= 2 && v.videoWidth > 0,
  );

  if (allVideos.length === 0) return;

  if (screenShareEl && allVideos.length > 1) {
    const cameraVideos = allVideos.filter((v) => v !== screenShareEl);
    const stripH = Math.round(H * 0.22);
    const mainH = H - stripH;
    ctx.drawImage(screenShareEl, 0, 0, W, mainH);
    const tileW = Math.round(W / cameraVideos.length);
    cameraVideos.forEach((v, i) => {
      ctx.drawImage(v, i * tileW, mainH, tileW, stripH);
    });
  } else if (allVideos.length === 1) {
    ctx.drawImage(allVideos[0], 0, 0, W, H);
  } else {
    const cols = Math.ceil(Math.sqrt(allVideos.length));
    const rows = Math.ceil(allVideos.length / cols);
    const tileW = Math.round(W / cols);
    const tileH = Math.round(H / rows);
    allVideos.forEach((v, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      ctx.drawImage(v, col * tileW, row * tileH, tileW, tileH);
    });
  }
}

export function VideoRoom({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const state = useConnectionState();
  const layoutContext = useCreateLayoutContext();
  const pipCanvasRef = useRef<HTMLCanvasElement>(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  // Auto-pin screen share when it appears; clear pin when it stops
  const screenShareTracks = tracks.filter(
    (t) => isTrackReference(t) && t.publication.source === Track.Source.ScreenShare,
  );
  useLayoutEffect(() => {
    if (!layoutContext.pin.dispatch) return;
    if (screenShareTracks.length > 0) {
      layoutContext.pin.dispatch({ msg: 'set_pin', trackReference: screenShareTracks[0]! });
    } else {
      layoutContext.pin.dispatch({ msg: 'clear_pin' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenShareTracks.length]);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter((t) => t !== focusTrack);

  // Canvas draw loop — only runs while PiP is active (cheap otherwise)
  useEffect(() => {
    let raf: number;
    const loop = () => {
      if (document.pictureInPictureElement && pipCanvasRef.current && containerRef.current) {
        drawPipCanvas(pipCanvasRef.current, containerRef.current);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [containerRef]);

  if (state === ConnectionState.Reconnecting) {
    return <div className={styles.statusMessage}>Reconnecting…</div>;
  }

  return (
    <LayoutContextProvider value={layoutContext}>
      <div className={styles.room}>
      {/* Hidden canvas used as PiP source — inline style ensures it never captures events */}
      <canvas ref={pipCanvasRef} width={1280} height={720} hidden style={{ display: 'none', position: 'absolute', pointerEvents: 'none' }} />
        <div className={styles.stage}>
          {!focusTrack || !isTrackReference(focusTrack) ? (
            <GridLayout tracks={tracks} className={styles.grid}>
              <ParticipantTile />
            </GridLayout>
          ) : (
            <FocusLayoutContainer>
              <CarouselLayout tracks={carouselTracks}>
                <ParticipantTile />
              </CarouselLayout>
              <FocusLayout trackRef={focusTrack} />
            </FocusLayoutContainer>
          )}
        </div>
        <ControlBar containerRef={containerRef} pipCanvasRef={pipCanvasRef} />
        <RoomAudioRenderer />
      </div>
    </LayoutContextProvider>
  );
}
