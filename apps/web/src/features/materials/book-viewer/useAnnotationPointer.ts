import { useCallback, useRef, useState } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import type {
  MaterialAnnotationTool,
  MaterialPageAnnotation,
} from '@pkg/types';
import {
  defaultTextBoxSize,
  newAnnotationId,
  normalizePenPoints,
  normPoint,
  type PageSize,
} from './annotation-layer-utils';
import { hitTextAnnotation } from './annotation-render-utils';

type DraftShape =
  | { type: 'pen'; points: number[] }
  | { type: 'rect'; x: number; y: number; width: number; height: number }
  | { type: 'ellipse'; x: number; y: number; radiusX: number; radiusY: number }
  | { type: 'arrow'; x1: number; y1: number; x2: number; y2: number };

interface UseAnnotationPointerOptions {
  readOnly: boolean;
  tool: MaterialAnnotationTool;
  color: string;
  strokeWidth: number;
  pageSize: PageSize;
  editableAnnotations: MaterialPageAnnotation[];
  commitAnnotation: (annotation: MaterialPageAnnotation) => void;
  setSelectedId: (id: string | null) => void;
  setEditingTextId: (id: string | null) => void;
}

export function useAnnotationPointer({
  readOnly, tool, color, strokeWidth, pageSize,
  editableAnnotations, commitAnnotation, setSelectedId, setEditingTextId,
}: UseAnnotationPointerOptions) {
  const [draft, setDraft] = useState<DraftShape | null>(null);
  const drawingRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const pointerPos = (event: KonvaEventObject<PointerEvent>) => {
    const stage = event.target.getStage();
    if (!stage) return null;
    return stage.getPointerPosition() ?? null;
  };

  const handleStagePointerDown = useCallback((event: KonvaEventObject<PointerEvent>) => {
    if (readOnly) return;

    if (tool === 'select') {
      const stage = event.target.getStage();
      if (event.target === stage) {
        setSelectedId(null);
        setEditingTextId(null);
      }
      return;
    }

    const pos = pointerPos(event);
    if (!pos) return;

    if (tool === 'text') {
      const hit = hitTextAnnotation(editableAnnotations, pos.x, pos.y, pageSize);
      if (hit) {
        setSelectedId(hit.id);
        setEditingTextId(hit.id);
        return;
      }

      const fontSize = Math.max(14, strokeWidth * 6);
      const box = defaultTextBoxSize(pageSize, fontSize);
      const [nx, ny] = normPoint(pos.x, pos.y, pageSize);
      const id = newAnnotationId();
      commitAnnotation({
        id,
        type: 'text',
        x: nx,
        y: ny,
        width: box.width,
        height: box.height,
        text: '',
        fontSize: box.fontSize,
        color,
        strokeWidth,
      });
      setEditingTextId(id);
      return;
    }

    setSelectedId(null);
    setEditingTextId(null);
    drawingRef.current = true;
    startRef.current = { x: pos.x, y: pos.y };

    if (tool === 'pen') {
      setDraft({ type: 'pen', points: [pos.x, pos.y] });
    }
  }, [readOnly, tool, color, strokeWidth, pageSize, editableAnnotations, commitAnnotation, setSelectedId, setEditingTextId]);

  const handlePointerMove = useCallback((event: KonvaEventObject<PointerEvent>) => {
    if (!drawingRef.current || readOnly) return;
    const pos = pointerPos(event);
    const start = startRef.current;
    if (!pos || !start) return;

    if (tool === 'pen') {
      setDraft((prev) => prev?.type === 'pen' ? { type: 'pen', points: [...prev.points, pos.x, pos.y] } : prev);
      return;
    }

    if (tool === 'rect') {
      setDraft({
        type: 'rect',
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        width: Math.abs(pos.x - start.x),
        height: Math.abs(pos.y - start.y),
      });
      return;
    }

    if (tool === 'ellipse') {
      setDraft({
        type: 'ellipse',
        x: (start.x + pos.x) / 2,
        y: (start.y + pos.y) / 2,
        radiusX: Math.abs(pos.x - start.x) / 2,
        radiusY: Math.abs(pos.y - start.y) / 2,
      });
      return;
    }

    if (tool === 'arrow') {
      setDraft({ type: 'arrow', x1: start.x, y1: start.y, x2: pos.x, y2: pos.y });
    }
  }, [readOnly, tool]);

  const handlePointerUp = useCallback(() => {
    if (!drawingRef.current || readOnly) return;
    drawingRef.current = false;

    setDraft((prev) => {
      if (tool === 'pen' && prev?.type === 'pen' && prev.points.length >= 4) {
        commitAnnotation({
          id: newAnnotationId(),
          type: 'pen',
          points: normalizePenPoints(prev.points, pageSize),
          color,
          strokeWidth,
        });
      }

      if (tool === 'rect' && prev?.type === 'rect' && prev.width > 2 && prev.height > 2) {
        const [nx, ny] = normPoint(prev.x, prev.y, pageSize);
        commitAnnotation({
          id: newAnnotationId(),
          type: 'rect',
          x: nx, y: ny,
          width: pageSize.width > 0 ? prev.width / pageSize.width : 0,
          height: pageSize.height > 0 ? prev.height / pageSize.height : 0,
          color, strokeWidth,
        });
      }

      if (tool === 'ellipse' && prev?.type === 'ellipse' && prev.radiusX > 2 && prev.radiusY > 2) {
        const [nx, ny] = normPoint(prev.x, prev.y, pageSize);
        commitAnnotation({
          id: newAnnotationId(),
          type: 'ellipse',
          x: nx, y: ny,
          radiusX: pageSize.width > 0 ? prev.radiusX / pageSize.width : 0,
          radiusY: pageSize.height > 0 ? prev.radiusY / pageSize.height : 0,
          color, strokeWidth,
        });
      }

      if (tool === 'arrow' && prev?.type === 'arrow') {
        const [nx1, ny1] = normPoint(prev.x1, prev.y1, pageSize);
        const [nx2, ny2] = normPoint(prev.x2, prev.y2, pageSize);
        commitAnnotation({
          id: newAnnotationId(),
          type: 'arrow',
          x1: nx1, y1: ny1, x2: nx2, y2: ny2,
          color, strokeWidth,
        });
      }

      return null;
    });
    startRef.current = null;
  }, [readOnly, tool, color, strokeWidth, pageSize, commitAnnotation]);

  return { draft, handleStagePointerDown, handlePointerMove, handlePointerUp };
}

export type { DraftShape };
