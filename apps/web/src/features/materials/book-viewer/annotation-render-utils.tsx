import { Arrow, Ellipse, Line, Rect, Text } from 'react-konva';
import type { MaterialPageAnnotation, MaterialTextAnnotation } from '@pkg/types';
import {
  denormPenPoints,
  denormX,
  denormY,
  normalizeTextAnnotation,
  type PageSize,
} from './annotation-layer-utils';

export function hitTextAnnotation(
  annotations: MaterialPageAnnotation[],
  x: number,
  y: number,
  size: PageSize,
): MaterialTextAnnotation | null {
  for (let index = annotations.length - 1; index >= 0; index -= 1) {
    const item = annotations[index];
    if (!item || item.type !== 'text') continue;
    const text = normalizeTextAnnotation(item);
    if (!text) continue;
    const left = denormX(text.x, size.width);
    const top = denormY(text.y, size.height);
    const right = left + denormX(text.width, size.width);
    const bottom = top + denormY(text.height, size.height);
    if (x >= left && x <= right && y >= top && y <= bottom) {
      return text;
    }
  }
  return null;
}

export function renderStaticAnnotation(
  annotation: MaterialPageAnnotation,
  size: PageSize,
  key: string,
) {
  const stroke = annotation.color;
  const strokeWidth = annotation.strokeWidth;

  switch (annotation.type) {
    case 'pen':
      return (
        <Line
          key={key}
          points={denormPenPoints(annotation.points, size)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          lineCap="round"
          lineJoin="round"
          tension={0.2}
          listening={false}
        />
      );
    case 'rect':
      return (
        <Rect
          key={key}
          x={denormX(annotation.x, size.width)}
          y={denormY(annotation.y, size.height)}
          width={denormX(annotation.width, size.width)}
          height={denormY(annotation.height, size.height)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          listening={false}
        />
      );
    case 'ellipse':
      return (
        <Ellipse
          key={key}
          x={denormX(annotation.x, size.width)}
          y={denormY(annotation.y, size.height)}
          radiusX={denormX(annotation.radiusX, size.width)}
          radiusY={denormY(annotation.radiusY, size.height)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          listening={false}
        />
      );
    case 'arrow':
      return (
        <Arrow
          key={key}
          points={[
            denormX(annotation.x1, size.width),
            denormY(annotation.y1, size.height),
            denormX(annotation.x2, size.width),
            denormY(annotation.y2, size.height),
          ]}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={stroke}
          pointerLength={8}
          pointerWidth={8}
          listening={false}
        />
      );
    case 'text': {
      const text = normalizeTextAnnotation(annotation);
      if (!text) return null;
      return (
        <Text
          key={key}
          x={denormX(text.x, size.width)}
          y={denormY(text.y, size.height)}
          width={denormX(text.width, size.width)}
          text={text.text}
          fontSize={text.fontSize}
          fill={stroke}
          listening={false}
        />
      );
    }
    default:
      return null;
  }
}
