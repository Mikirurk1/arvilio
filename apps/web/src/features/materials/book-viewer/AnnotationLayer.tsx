'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Arrow, Ellipse, Layer, Line, Rect, Stage } from 'react-konva';
import type {
  MaterialAnnotationDocument,
  MaterialAnnotationTool,
} from '@pkg/types';
import {
  appendAnnotation,
  denormX,
  denormY,
  normalizeTextAnnotation,
  pageKey,
  updateAnnotation,
  type PageSize,
} from './annotation-layer-utils';
import { renderStaticAnnotation } from './annotation-render-utils';
import { useAnnotationPointer } from './useAnnotationPointer';
import { TextAnnotationShape } from './TextAnnotationShape';
import styles from './book-viewer.module.scss';

type Props = {
  pageIndex: number;
  pageSize: PageSize;
  baseDocument: MaterialAnnotationDocument;
  editableDocument: MaterialAnnotationDocument;
  readOnly: boolean;
  tool: MaterialAnnotationTool;
  color: string;
  strokeWidth: number;
  onDocumentChange: (updater: (prev: MaterialAnnotationDocument) => MaterialAnnotationDocument) => void;
  onUndoStackPush: () => void;
};

export function AnnotationLayer({
  pageIndex,
  pageSize,
  baseDocument,
  editableDocument,
  readOnly,
  tool,
  color,
  strokeWidth,
  onDocumentChange,
  onUndoStackPush,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const textEditorRef = useRef<HTMLTextAreaElement>(null);

  const baseAnnotations = useMemo(
    () => baseDocument.pages[pageKey(pageIndex)] ?? [],
    [baseDocument.pages, pageIndex],
  );
  const editableAnnotations = useMemo(
    () => editableDocument.pages[pageKey(pageIndex)] ?? [],
    [editableDocument.pages, pageIndex],
  );

  useEffect(() => {
    setSelectedId(null);
    setEditingTextId(null);
  }, [pageIndex]);

  useEffect(() => {
    if (tool !== 'text') {
      setEditingTextId(null);
    }
  }, [tool]);

  const selectedText = useMemo(
    () =>
      editableAnnotations
        .map((item) => normalizeTextAnnotation(item))
        .find((item) => item && item.id === selectedId) ?? null,
    [editableAnnotations, selectedId],
  );

  const isEditingText = selectedText != null && editingTextId === selectedText.id;

  const commitAnnotation = useCallback(
    (annotation: MaterialPageAnnotation) => {
      onUndoStackPush();
      onDocumentChange((prev) => appendAnnotation(prev, pageIndex, annotation));
      if (annotation.type === 'text') {
        setSelectedId(annotation.id);
      }
    },
    [onDocumentChange, onUndoStackPush, pageIndex],
  );

  const updateSelected = useCallback(
    (next: MaterialPageAnnotation) => {
      onDocumentChange((prev) => updateAnnotation(prev, pageIndex, next.id, next));
    },
    [onDocumentChange, pageIndex],
  );

  const beginGesture = useCallback(() => {
    onUndoStackPush();
  }, [onUndoStackPush]);

  useEffect(() => {
    const editor = textEditorRef.current;
    if (!editor || !isEditingText || !selectedText) return;

    const syncSize = () => {
      const widthPx = editor.offsetWidth;
      const heightPx = editor.offsetHeight;
      if (pageSize.width <= 0 || pageSize.height <= 0) return;
      const nextWidth = widthPx / pageSize.width;
      const nextHeight = heightPx / pageSize.height;
      if (
        Math.abs(nextWidth - selectedText.width) < 0.001
        && Math.abs(nextHeight - selectedText.height) < 0.001
      ) {
        return;
      }
      updateSelected({
        ...selectedText,
        width: nextWidth,
        height: nextHeight,
      });
    };

    const observer = new ResizeObserver(() => {
      syncSize();
    });
    observer.observe(editor);
    return () => observer.disconnect();
  }, [isEditingText, pageSize.height, pageSize.width, selectedText, updateSelected]);

  const { draft, handleStagePointerDown, handlePointerMove, handlePointerUp } = useAnnotationPointer({
    readOnly, tool, color, strokeWidth, pageSize,
    editableAnnotations, commitAnnotation, setSelectedId, setEditingTextId,
  });

  if (pageSize.width <= 0 || pageSize.height <= 0) return null;

  return (
    <div className={styles.annotationWrap}>
      <Stage
        width={pageSize.width}
        height={pageSize.height}
        className={styles.annotationStage}
        onPointerDown={handleStagePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <Layer listening={false}>
          {baseAnnotations.map((annotation) =>
            renderStaticAnnotation(annotation, pageSize, `base-${annotation.id}`),
          )}
        </Layer>
        <Layer>
          {editableAnnotations.map((annotation) => {
            if (annotation.type === 'text') {
              const text = normalizeTextAnnotation(annotation);
              if (!text) return null;
              return (
                <TextAnnotationShape
                  key={text.id}
                  annotation={text}
                  size={pageSize}
                  selected={selectedId === text.id}
                  readOnly={readOnly}
                  editing={editingTextId === text.id}
                  transformable={tool === 'select' && !readOnly}
                  draggable={tool === 'select' && selectedId === text.id && !readOnly && editingTextId !== text.id}
                  onSelect={() => {
                    setSelectedId(text.id);
                    if (tool === 'text') {
                      setEditingTextId(text.id);
                    }
                  }}
                  onEdit={() => {
                    setSelectedId(text.id);
                    setEditingTextId(text.id);
                  }}
                  onGestureStart={beginGesture}
                  onDragEnd={(x, y) => {
                    const [nx, ny] = normPoint(x, y, pageSize);
                    updateSelected({ ...text, x: nx, y: ny });
                  }}
                  onTransformEnd={({ x, y, width, height, fontSize }) => {
                    const [nx, ny] = normPoint(x, y, pageSize);
                    updateSelected({
                      ...text,
                      x: nx,
                      y: ny,
                      width: pageSize.width > 0 ? width / pageSize.width : text.width,
                      height: pageSize.height > 0 ? height / pageSize.height : text.height,
                      fontSize,
                    });
                  }}
                />
              );
            }
            return renderStaticAnnotation(annotation, pageSize, `edit-${annotation.id}`);
          })}
          {draft?.type === 'pen' ? (
            <Line
              points={draft.points}
              stroke={color}
              strokeWidth={strokeWidth}
              lineCap="round"
              lineJoin="round"
              tension={0.2}
              listening={false}
            />
          ) : null}
          {draft?.type === 'rect' ? (
            <Rect
              x={draft.x}
              y={draft.y}
              width={draft.width}
              height={draft.height}
              stroke={color}
              strokeWidth={strokeWidth}
              listening={false}
            />
          ) : null}
          {draft?.type === 'ellipse' ? (
            <Ellipse
              x={draft.x}
              y={draft.y}
              radiusX={draft.radiusX}
              radiusY={draft.radiusY}
              stroke={color}
              strokeWidth={strokeWidth}
              listening={false}
            />
          ) : null}
          {draft?.type === 'arrow' ? (
            <Arrow
              points={[draft.x1, draft.y1, draft.x2, draft.y2]}
              stroke={color}
              strokeWidth={strokeWidth}
              fill={color}
              pointerLength={8}
              pointerWidth={8}
              listening={false}
            />
          ) : null}
        </Layer>
      </Stage>
      {isEditingText && selectedText && !readOnly ? (
        <textarea
          ref={textEditorRef}
          className={styles.textEditor}
          style={{
            left: denormX(selectedText.x, pageSize.width),
            top: denormY(selectedText.y, pageSize.height),
            width: denormX(selectedText.width, pageSize.width),
            height: denormY(selectedText.height, pageSize.height),
            fontSize: selectedText.fontSize,
            color: selectedText.color,
          }}
          value={selectedText.text}
          placeholder="Type here…"
          autoFocus
          onChange={(event) => updateSelected({ ...selectedText, text: event.target.value })}
          onBlur={() => setEditingTextId(null)}
          onPointerDown={(event) => event.stopPropagation()}
        />
      ) : null}
    </div>
  );
}
