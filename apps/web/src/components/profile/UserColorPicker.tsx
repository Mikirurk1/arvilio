'use client';

import { useRef, useState } from 'react';
import { Pipette } from 'lucide-react';
import { Button, Field } from '../ui';
import styles from './ProfileForm.module.scss';

type HslColor = { h: number; s: number; l: number };

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampHue(value: number): number {
  const mod = value % 360;
  return mod < 0 ? mod + 360 : mod;
}

function hexToHsl(hex: string): HslColor | null {
  const normalized = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  if (delta === 0) return { h: 0, s: 0, l };
  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  return { h: clampHue(h * 60), s: clamp01(s), l: clamp01(l) };
}

function hslToHex(color: HslColor): string {
  const h = clampHue(color.h);
  const s = clamp01(color.s);
  const l = clamp01(color.l);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function UserColorPicker({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (nextHex: string) => void;
}) {
  const [hsl, setHsl] = useState<HslColor>(() => hexToHsl(value) ?? { h: 210, s: 0.54, l: 0.5 });
  const [open, setOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  const applyHsl = (next: HslColor) => {
    setHsl(next);
    onChange(hslToHex(next));
  };

  const updateFromPalettePointer = (clientX: number, clientY: number) => {
    const rect = paletteRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = clamp01((clientX - rect.left) / rect.width);
    const l = clamp01(1 - (clientY - rect.top) / rect.height);
    applyHsl({ ...hsl, s, l });
  };

  const startPaletteDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    updateFromPalettePointer(event.clientX, event.clientY);
  };

  return (
    <div className={styles.colorPicker}>
      <div className={styles.colorControlsRowCompact}>
        <div className={styles.colorSwatch} style={{ backgroundColor: hslToHex(hsl) }} />
        <Field
          type="text"
          className={styles.input}
          value={value}
          readOnly={disabled}
          placeholder="#3b82c4"
          onChange={(e) => {
            const next = e.target.value;
            onChange(next);
            const parsed = hexToHsl(next);
            if (parsed) setHsl(parsed);
          }}
        />
        <Button
          type="button"
          className={styles.colorPickerToggleBtn}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
        >
          <Pipette size={16} aria-hidden />
        </Button>
      </div>
      {open ? (
        <>
          <div
            ref={paletteRef}
            className={`${styles.colorPalette} ${disabled ? styles.colorPaletteDisabled : ''}`}
            style={{ backgroundColor: `hsl(${hsl.h} 100% 50%)` }}
            onPointerDown={startPaletteDrag}
            onPointerMove={(event) => {
              if (!disabled && event.buttons === 1)
                updateFromPalettePointer(event.clientX, event.clientY);
            }}
          >
            <span
              className={styles.colorPickerThumb}
              style={{ left: `${hsl.s * 100}%`, top: `${(1 - hsl.l) * 100}%` }}
            />
          </div>
          <div className={styles.colorControlsRow}>
            <input
              type="range"
              min={0}
              max={360}
              value={Math.round(hsl.h)}
              disabled={disabled}
              className={styles.colorHueSlider}
              onChange={(event) => applyHsl({ ...hsl, h: Number(event.target.value) })}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
