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

export function getRevealExitProgressFromTop(input: {
  top: number;
  exitStartPx: number;
  exitRangePx: number;
}) {
  const end = input.exitStartPx - input.exitRangePx;
  const raw = (input.top - end) / Math.max(1, input.exitStartPx - end);

  return clampRevealProgress(raw);
}

export function isInRevealExitBand(input: {
  top: number;
  exitStartPx: number;
  exitHysteresisPx?: number;
  exitVisibleRatio?: number;
  exitVisibleRatioThreshold?: number;
  exitVisibleRatioHysteresis?: number;
  wasExiting: boolean;
}) {
  const exitHysteresisPx = Math.max(0, input.exitHysteresisPx ?? 0);
  const enterThreshold = input.exitStartPx - exitHysteresisPx;
  const leaveThreshold = input.exitStartPx + exitHysteresisPx;
  const exitVisibleRatioThreshold = input.exitVisibleRatioThreshold;
  const exitVisibleRatioHysteresis = Math.max(0, input.exitVisibleRatioHysteresis ?? 0);
  const exitVisibleRatio = input.exitVisibleRatio ?? 1;
  const hasVisibleRatioGate =
    typeof exitVisibleRatioThreshold === "number" &&
    typeof input.exitVisibleRatio === "number";

  const meetsEnterRatioThreshold =
    !hasVisibleRatioGate || exitVisibleRatio <= exitVisibleRatioThreshold;
  const meetsLeaveRatioThreshold =
    !hasVisibleRatioGate ||
    exitVisibleRatio <= exitVisibleRatioThreshold + exitVisibleRatioHysteresis;

  if (input.wasExiting) {
    return input.top <= leaveThreshold && meetsLeaveRatioThreshold;
  }

  return input.top <= enterThreshold && meetsEnterRatioThreshold;
}
