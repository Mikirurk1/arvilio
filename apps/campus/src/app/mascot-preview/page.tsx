'use client';

import { Mascot } from '../../components/mascot/Mascot';
import { MASCOT_POSES, type MascotPose } from '../../lib/mascot-capability';
import { useCampusT } from '../../lib/cms';

/**
 * Dev preview for the Arvi mascot (Phase 4.5.4 / B7). Renders every pose at a few
 * sizes so the GLB can be checked without going through the first-login tour.
 * Drop `public/mascot/arvi.glb` to see the 3D model; otherwise the 2D fallback.
 */
const POSES: MascotPose[] = [...MASCOT_POSES];

export default function MascotPreviewPage() {
  const t = useCampusT();
  return (
    <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>{t('mascot.preview.title')}</h1>
      <p style={{ color: '#667' }}>{t('mascot.preview.intro')}</p>

      <h2 style={{ fontSize: '1rem' }}>{t('mascot.preview.posesHeading')}</h2>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {POSES.map((pose) => (
          <figure key={pose} style={{ margin: 0, textAlign: 'center' }}>
            <div
              style={{
                width: 160,
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                background: '#fafafa',
              }}
            >
              <Mascot pose={pose} size={140} />
            </div>
            <figcaption style={{ marginTop: 8, color: '#445' }}>{pose}</figcaption>
          </figure>
        ))}
      </div>

      <h2 style={{ fontSize: '1rem', marginTop: 32 }}>{t('mascot.preview.sizesHeading')}</h2>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
        {[40, 56, 72, 120].map((size) => (
          <div key={size} style={{ textAlign: 'center' }}>
            <Mascot pose="idle" size={size} />
            <div style={{ color: '#445', marginTop: 6 }}>{size}px</div>
          </div>
        ))}
      </div>
    </div>
  );
}
