'use client';

import type { MaterialAnnotationTool } from '@pkg/types';
import {
  ArrowUpRight,
  Circle,
  Download,
  MousePointer2,
  Pencil,
  Square,
  Trash2,
  Type,
  Undo2,
} from 'lucide-react';
import { Button } from '../../../components/ui';
import styles from './book-viewer.module.scss';

const TOOL_OPTIONS: Array<{ tool: MaterialAnnotationTool; label: string; Icon: typeof Pencil }> = [
  { tool: 'select', label: 'Select', Icon: MousePointer2 },
  { tool: 'pen', label: 'Pen', Icon: Pencil },
  { tool: 'rect', label: 'Rectangle', Icon: Square },
  { tool: 'ellipse', label: 'Ellipse', Icon: Circle },
  { tool: 'arrow', label: 'Arrow', Icon: ArrowUpRight },
  { tool: 'text', label: 'Text', Icon: Type },
];

const COLORS = ['#e11d48', '#2563eb', '#16a34a', '#ca8a04', '#111827'];

type Props = {
  tool: MaterialAnnotationTool;
  color: string;
  strokeWidth: number;
  canEdit: boolean;
  canClearOverlay: boolean;
  canUndo: boolean;
  downloadHref: string;
  saveLabel: string;
  onToolChange: (tool: MaterialAnnotationTool) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onClearOverlay: () => void;
};

export function AnnotationToolbar({
  tool,
  color,
  strokeWidth,
  canEdit,
  canClearOverlay,
  canUndo,
  downloadHref,
  saveLabel,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onClearOverlay,
}: Props) {
  return (
    <div className={styles.toolbar}>
      {canEdit ? (
        <>
          <div className={styles.toolGroup} role="toolbar" aria-label="Drawing tools">
            {TOOL_OPTIONS.map(({ tool: option, label, Icon }) => (
              <Button
                key={option}
                type="button"
                variant={tool === option ? 'primary' : 'ghost'}
                className={styles.toolBtn}
                aria-label={label}
                aria-pressed={tool === option}
                onClick={() => onToolChange(option)}
              >
                <Icon size={16} aria-hidden />
              </Button>
            ))}
          </div>
          <div className={styles.toolGroup} aria-label="Colors">
            {COLORS.map((swatch) => (
              <Button
                key={swatch}
                variant="bare"
                type="button"
                className={[styles.colorSwatch, color === swatch ? styles.colorSwatchActive : ''].join(' ')}
                style={{ backgroundColor: swatch }}
                aria-label={`Color ${swatch}`}
                aria-pressed={color === swatch}
                onClick={() => onColorChange(swatch)}
              />
            ))}
          </div>
          <label className={styles.strokeControl}>
            <span className={styles.strokeLabel}>Stroke</span>
            <input
              type="range"
              min={1}
              max={8}
              value={strokeWidth}
              onChange={(event) => onStrokeWidthChange(Number(event.target.value))}
            />
          </label>
          <Button
            type="button"
            variant="ghost"
            className={styles.toolBtn}
            disabled={!canUndo}
            aria-label="Undo"
            onClick={onUndo}
          >
            <Undo2 size={16} aria-hidden />
          </Button>
          {canClearOverlay ? (
            <Button
              type="button"
              variant="ghost"
              className={styles.clearOverlayBtn}
              aria-label="Remove my additions"
              onClick={onClearOverlay}
            >
              <Trash2 size={16} aria-hidden />
              Remove my additions
            </Button>
          ) : null}
        </>
      ) : null}
      <div className={styles.toolbarSpacer} />
      <span className={styles.saveStatus} aria-live="polite">
        {saveLabel}
      </span>
      <a href={downloadHref} className={styles.downloadLink} download>
        <Download size={16} aria-hidden />
        Download
      </a>
    </div>
  );
}
