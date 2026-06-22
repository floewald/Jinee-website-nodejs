export function clampRevealProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function shouldSettleImmediately(input: {
  top: number;
  bottom: number;
  left: number;
  right: number;
  viewportHeight: number;
  viewportWidth: number;
}) {
  const visibleTop = Math.max(input.top, 0);
  const visibleBottom = Math.min(input.bottom, input.viewportHeight);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);

  return visibleHeight > 1 && input.left < input.viewportWidth && input.right > 0;
}

export function getRevealProgressFromRect(input: {
  top: number;
  bottom: number;
  viewportHeight: number;
  entryOffsetPx: number;
  settleOffsetPx: number;
}) {
  const start = input.viewportHeight + input.entryOffsetPx;
  const end = input.viewportHeight - input.settleOffsetPx;
  const raw = 1 - (input.top - end) / Math.max(1, start - end);

  return clampRevealProgress(raw);
}
