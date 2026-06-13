export interface RectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clampWindowToBounds(
  position: { x: number; y: number },
  windowSize: { width: number; height: number },
  bounds: RectLike,
  padding: number
): { position: { x: number; y: number }; bounced: boolean } {
  const minX = bounds.x + padding;
  const maxX = bounds.x + bounds.width - windowSize.width - padding;
  const minY = bounds.y + padding;
  const maxY = bounds.y + bounds.height - windowSize.height - padding;

  const x = Math.min(maxX, Math.max(minX, position.x));
  const y = Math.min(maxY, Math.max(minY, position.y));

  return {
    position: { x, y },
    bounced: x !== position.x || y !== position.y
  };
}
