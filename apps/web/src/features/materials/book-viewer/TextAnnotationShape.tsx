'use client';

import { useEffect, useRef } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { MaterialTextAnnotation } from '@pkg/types';
import type { PageSize } from './annotation-layer-utils';
import { denormX, denormY } from './annotation-layer-utils';

type Props = {
  annotation: MaterialTextAnnotation;
  size: PageSize;
  selected: boolean;
  readOnly: boolean;
  editing: boolean;
  transformable: boolean;
  draggable: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onGestureStart: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (next: {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
  }) => void;
};

export function TextAnnotationShape({
  annotation,
  size,
  selected,
  readOnly,
  editing,
  transformable,
  draggable,
  onSelect,
  onEdit,
  onGestureStart,
  onDragEnd,
  onTransformEnd,
}: Props) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const x = denormX(annotation.x, size.width);
  const y = denormY(annotation.y, size.height);
  const width = denormX(annotation.width, size.width);
  const height = denormY(annotation.height, size.height);

  useEffect(() => {
    const transformer = transformerRef.current;
    const group = groupRef.current;
    if (!transformer) return;

    if (transformable && selected && group) {
      transformer.nodes([group]);
      transformer.getLayer()?.batchDraw();
      return;
    }

    transformer.nodes([]);
    transformer.getLayer()?.batchDraw();
  }, [selected, transformable, width, height, x, y, annotation.fontSize]);

  const handleTransformEnd = (event: KonvaEventObject<Event>) => {
    const node = event.target as Konva.Group;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onTransformEnd({
      x: node.x(),
      y: node.y(),
      width: Math.max(40, width * scaleX),
      height: Math.max(24, height * scaleY),
      fontSize: Math.max(10, Math.min(96, annotation.fontSize * scaleY)),
    });
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        draggable={draggable}
        onClick={(event) => {
          event.cancelBubble = true;
          onSelect();
        }}
        onTap={(event) => {
          event.cancelBubble = true;
          onSelect();
        }}
        onDblClick={(event) => {
          event.cancelBubble = true;
          if (!readOnly) onEdit();
        }}
        onDblTap={(event) => {
          event.cancelBubble = true;
          if (!readOnly) onEdit();
        }}
        onDragStart={(event) => {
          event.cancelBubble = true;
          onGestureStart();
        }}
        onDragEnd={(event: KonvaEventObject<DragEvent>) => {
          onDragEnd(event.target.x(), event.target.y());
        }}
        onTransformStart={(event) => {
          event.cancelBubble = true;
          onGestureStart();
        }}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={width}
          height={height}
          stroke={selected ? annotation.color : `${annotation.color}88`}
          strokeWidth={selected ? 2 : 1}
          dash={selected && !editing ? undefined : [4, 4]}
          fill="rgba(255,255,255,0.85)"
        />
        {!editing ? (
          <Text
            text={annotation.text || 'Text'}
            width={width - 8}
            height={height - 8}
            x={4}
            y={4}
            fontSize={annotation.fontSize}
            fill={annotation.color}
            wrap="word"
            listening={false}
          />
        ) : null}
      </Group>
      {transformable && selected ? (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right',
            'top-center',
            'bottom-center',
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 40 || newBox.height < 24) return oldBox;
            return newBox;
          }}
        />
      ) : null}
    </>
  );
}
