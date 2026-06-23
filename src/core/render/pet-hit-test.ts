export function hitTestYuzai(x: number, y: number, width = 280, height = 280): boolean {
  const scaleX = width / 280;
  const scaleY = height / 280;
  const cx = 140 * scaleX;
  const cy = 150 * scaleY;
  const rx = 116 * scaleX;
  const ry = 124 * scaleY;
  const normalized = Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2);
  return normalized <= 1.08;
}
