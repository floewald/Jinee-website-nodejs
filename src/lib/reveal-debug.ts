export interface RevealDebugSnapshot {
  phase: string;
  reason?: string;
  surfaceLabel?: string;
  state?: string;
  scrollY?: number;
  top?: number;
  bottom?: number;
  rawTop?: number;
  rawBottom?: number;
  translateY?: number;
  computedOpacity?: number;
  exitMaskStartPercent?: number;
  visibleRatio?: number;
  exitAnchorTop?: number;
  exitVisibleRatioThresholdUsed?: number;
  aspectMode?: "portrait" | "landscape";
  entryProgress?: number;
  exitProgress?: number;
  visible?: boolean;
  entryLocked?: boolean;
  active?: boolean;
  intersecting?: boolean;
  intersectionRatio?: number;
  armed?: boolean;
  pending?: boolean;
  exiting?: boolean;
  wasExiting?: boolean;
}

const REVEAL_DEBUG_PARAM = "revealDebug";
const REVEAL_DEBUG_HISTORY_LIMIT = 8;
const REVEAL_DEBUG_GLOBAL_LIMIT = 300;
const REVEAL_DEBUG_SESSION_ID =
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `reveal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const DEBUG_DATA_ATTRIBUTES = [
  "data-reveal-debug-enabled",
  "data-reveal-debug-phase",
  "data-reveal-debug-reason",
  "data-reveal-debug-state",
  "data-reveal-debug-summary",
  "data-reveal-debug-history",
];
const revealDebugHistory = new WeakMap<HTMLElement, string[]>();
const revealDebugLastEventKey = new WeakMap<HTMLElement, string>();

interface RevealDebugEventRecord extends RevealDebugSnapshot {
  sessionId: string;
  itemId: string;
  tileIndex: string;
  alt: string;
  src: string;
  pageSignature: string;
  sequence: number;
  timestampMs: number;
}

interface RevealDebugRow {
  sessionId: string;
  itemId: string;
  tileIndex: string;
  alt: string;
  src: string;
  pageSignature: string;
  sequence: number;
  phase: string;
  reason: string;
  surfaceLabel: string | null;
  scrollY: number | null;
  top: number | null;
  rawTop: number | null;
  translateY: number | null;
  computedOpacity: number | null;
  exitMaskStartPercent: number | null;
  visibleRatio: number | null;
  exitAnchorTop: number | null;
  exitVisibleRatioThresholdUsed: number | null;
  aspectMode: "portrait" | "landscape" | null;
  entryProgress: number | null;
  exitProgress: number | null;
  intersectionRatio: number | null;
  active: boolean | null;
  entryLocked: boolean | null;
  exiting: boolean | null;
  wasExiting: boolean | null;
}

interface RevealDebugFlipRow {
  prevSequence: number;
  nextSequence: number;
  prevReason: string;
  nextReason: string;
  prevSurfaceLabel: string | null;
  nextSurfaceLabel: string | null;
  prevScrollY: number | null;
  nextScrollY: number | null;
  deltaScrollY: number | null;
  prevTop: number | null;
  nextTop: number | null;
  deltaTop: number | null;
  prevOpacity: number | null;
  nextOpacity: number | null;
  prevVisibleRatio: number | null;
  nextVisibleRatio: number | null;
  prevExitProgress: number | null;
  nextExitProgress: number | null;
  prevExiting: boolean | null;
  nextExiting: boolean | null;
  prevWasExiting: boolean | null;
  nextWasExiting: boolean | null;
  prevGate: number | null;
  nextGate: number | null;
  prevTranslateY: number | null;
  nextTranslateY: number | null;
}

interface RevealDebugStore {
  byTile: Record<string, RevealDebugEventRecord[]>;
  byItem: Record<string, RevealDebugEventRecord[]>;
  events: RevealDebugEventRecord[];
  sequence: number;
  pageSignature: string;
  sessionId: string;
  getRecentEvents?: (limit?: number) => RevealDebugEventRecord[];
  getTileEvents?: (tileIndex: string | number, limit?: number) => RevealDebugEventRecord[];
  getItemEvents?: (itemId: string, limit?: number) => RevealDebugEventRecord[];
  getRecentRows?: (limit?: number) => RevealDebugRow[];
  getTileRows?: (tileIndex: string | number, limit?: number) => RevealDebugRow[];
  getItemRows?: (itemId: string, limit?: number) => RevealDebugRow[];
  getTileFlips?: (tileIndex: string | number, limit?: number) => RevealDebugFlipRow[];
  getItemFlips?: (itemId: string, limit?: number) => RevealDebugFlipRow[];
  stringifyTileRows?: (tileIndex: string | number, limit?: number) => string;
  stringifyItemRows?: (itemId: string, limit?: number) => string;
  stringifyRecentRows?: (limit?: number) => string;
  downloadTileRows?: (tileIndex: string | number, limit?: number) => void;
  downloadItemRows?: (itemId: string, limit?: number) => void;
  downloadRecentRows?: (limit?: number) => void;
  listItems?: () => Array<{
    itemId: string;
    tileIndex: string;
    alt: string;
    src: string;
    lastReason: string;
    lastScrollY: number | null;
  }>;
}

function formatDebugNumber(value: number | undefined, digits = 2) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return value.toFixed(digits);
}

function formatDebugBoolean(value: boolean | undefined) {
  if (typeof value !== "boolean") {
    return "-";
  }

  return value ? "yes" : "no";
}

function getRevealDebugStore() {
  if (typeof window === "undefined") {
    return null;
  }

  const revealDebugWindow = window as Window & {
    __REVEAL_DEBUG__?: RevealDebugStore;
  };

  const pageSignature = `${window.location.pathname}${window.location.search}`;

  if (
    !revealDebugWindow.__REVEAL_DEBUG__ ||
    revealDebugWindow.__REVEAL_DEBUG__.pageSignature !== pageSignature
  ) {
    revealDebugWindow.__REVEAL_DEBUG__ = {
      byTile: {},
      byItem: {},
      events: [],
      sequence: 0,
      pageSignature,
      sessionId: REVEAL_DEBUG_SESSION_ID,
    };
  }

  if (revealDebugWindow.__REVEAL_DEBUG__.sessionId !== REVEAL_DEBUG_SESSION_ID) {
    revealDebugWindow.__REVEAL_DEBUG__ = {
      byTile: {},
      byItem: {},
      events: [],
      sequence: 0,
      pageSignature,
      sessionId: REVEAL_DEBUG_SESSION_ID,
    };
  }

  attachRevealDebugHelpers(revealDebugWindow.__REVEAL_DEBUG__);

  return revealDebugWindow.__REVEAL_DEBUG__;
}

function toRevealDebugRow(event: RevealDebugEventRecord): RevealDebugRow {
  return {
    sessionId: event.sessionId,
    itemId: event.itemId,
    tileIndex: event.tileIndex,
    alt: event.alt,
    src: event.src,
    pageSignature: event.pageSignature,
    sequence: event.sequence,
    phase: event.phase,
    reason: event.reason ?? "",
    surfaceLabel: event.surfaceLabel ?? null,
    scrollY: event.scrollY ?? null,
    top: event.top ?? null,
    rawTop: event.rawTop ?? null,
    translateY: event.translateY ?? null,
    computedOpacity: event.computedOpacity ?? null,
    exitMaskStartPercent: event.exitMaskStartPercent ?? null,
    visibleRatio: event.visibleRatio ?? null,
    exitAnchorTop: event.exitAnchorTop ?? null,
    exitVisibleRatioThresholdUsed: event.exitVisibleRatioThresholdUsed ?? null,
    aspectMode: event.aspectMode ?? null,
    entryProgress: event.entryProgress ?? null,
    exitProgress: event.exitProgress ?? null,
    intersectionRatio: event.intersectionRatio ?? null,
    active: event.active ?? null,
    entryLocked: event.entryLocked ?? null,
    exiting: event.exiting ?? null,
    wasExiting: event.wasExiting ?? null,
  };
}

function attachRevealDebugHelpers(store: RevealDebugStore) {
  if (
    store.getRecentEvents &&
    store.getTileEvents &&
    store.getItemEvents &&
    store.getRecentRows &&
    store.getTileRows &&
    store.getItemRows &&
    store.getTileFlips &&
    store.getItemFlips &&
    store.stringifyTileRows &&
    store.stringifyItemRows &&
    store.stringifyRecentRows &&
    store.downloadTileRows &&
    store.downloadItemRows &&
    store.downloadRecentRows
  ) {
    return;
  }

  store.getRecentEvents = (limit = 50) => store.events.slice(-Math.max(1, limit));
  store.getTileEvents = (tileIndex, limit = 50) =>
    (store.byTile[String(tileIndex)] ?? []).slice(-Math.max(1, limit));
  store.getItemEvents = (itemId, limit = 50) =>
    (store.byItem[itemId] ?? []).slice(-Math.max(1, limit));
  store.getRecentRows = (limit = 50) =>
    store.getRecentEvents?.(limit).map((event) => toRevealDebugRow(event)) ?? [];
  store.getTileRows = (tileIndex, limit = 50) =>
    store.getTileEvents?.(tileIndex, limit).map((event) => toRevealDebugRow(event)) ?? [];
  store.getItemRows = (itemId, limit = 50) =>
    store.getItemEvents?.(itemId, limit).map((event) => toRevealDebugRow(event)) ?? [];
  store.getTileFlips = (tileIndex, limit = 80) => {
    const rows = store.getTileRows?.(tileIndex, limit) ?? [];
    return getRevealDebugFlips(rows);
  };
  store.getItemFlips = (itemId, limit = 80) => {
    const rows = store.getItemRows?.(itemId, limit) ?? [];
    return getRevealDebugFlips(rows);
  };
  store.stringifyTileRows = (tileIndex, limit = 80) =>
    JSON.stringify(store.getTileRows?.(tileIndex, limit) ?? [], null, 2);
  store.stringifyItemRows = (itemId, limit = 80) =>
    JSON.stringify(store.getItemRows?.(itemId, limit) ?? [], null, 2);
  store.stringifyRecentRows = (limit = 120) =>
    JSON.stringify(store.getRecentRows?.(limit) ?? [], null, 2);
  store.downloadTileRows = (tileIndex, limit = 80) => {
    downloadRevealDebugJson(
      `reveal-tile-${String(tileIndex)}-${limit}.json`,
      store.getTileRows?.(tileIndex, limit) ?? []
    );
  };
  store.downloadItemRows = (itemId, limit = 80) => {
    downloadRevealDebugJson(
      `reveal-item-${itemId.replace(/[^a-z0-9_-]/gi, "_")}-${limit}.json`,
      store.getItemRows?.(itemId, limit) ?? []
    );
  };
  store.downloadRecentRows = (limit = 120) => {
    downloadRevealDebugJson(
      `reveal-recent-${limit}.json`,
      store.getRecentRows?.(limit) ?? []
    );
  };
  store.listItems = () =>
    Object.values(store.byItem)
      .map((events) => events[events.length - 1])
      .filter((event): event is RevealDebugEventRecord => !!event)
      .map((event) => ({
        itemId: event.itemId,
        tileIndex: event.tileIndex,
        alt: event.alt,
        src: event.src,
        lastReason: event.reason ?? "",
        lastScrollY: event.scrollY ?? null,
      }))
      .sort((left, right) => left.itemId.localeCompare(right.itemId));
}

function getRevealDebugFlips(rows: RevealDebugRow[]) {
  const flips: RevealDebugFlipRow[] = [];

  for (let index = 1; index < rows.length; index += 1) {
    const previous = rows[index - 1];
    const current = rows[index];
    if (previous.reason === current.reason) {
      continue;
    }

    flips.push({
      prevSequence: previous.sequence,
      nextSequence: current.sequence,
      prevReason: previous.reason,
      nextReason: current.reason,
      prevSurfaceLabel: previous.surfaceLabel,
      nextSurfaceLabel: current.surfaceLabel,
      prevScrollY: previous.scrollY,
      nextScrollY: current.scrollY,
      deltaScrollY:
        previous.scrollY === null || current.scrollY === null
          ? null
          : current.scrollY - previous.scrollY,
      prevTop: previous.top,
      nextTop: current.top,
      deltaTop:
        previous.top === null || current.top === null
          ? null
          : current.top - previous.top,
      prevOpacity: previous.computedOpacity,
      nextOpacity: current.computedOpacity,
      prevVisibleRatio: previous.visibleRatio,
      nextVisibleRatio: current.visibleRatio,
      prevExitProgress: previous.exitProgress,
      nextExitProgress: current.exitProgress,
      prevExiting: previous.exiting,
      nextExiting: current.exiting,
      prevWasExiting: previous.wasExiting,
      nextWasExiting: current.wasExiting,
      prevGate: previous.exitVisibleRatioThresholdUsed,
      nextGate: current.exitVisibleRatioThresholdUsed,
      prevTranslateY: previous.translateY,
      nextTranslateY: current.translateY,
    });
  }

  return flips;
}

function downloadRevealDebugJson(filename: string, value: unknown) {
  if (typeof document === "undefined") {
    return;
  }

  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function isRevealDebugEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.location.search.includes(`${REVEAL_DEBUG_PARAM}=1`);
}

export function clearRevealDebugSnapshot(item: HTMLElement) {
  DEBUG_DATA_ATTRIBUTES.forEach((attribute) => item.removeAttribute(attribute));
  revealDebugHistory.delete(item);
  revealDebugLastEventKey.delete(item);
}

function appendRevealDebugHistory(item: HTMLElement, enabled: boolean, entry: string, key: string) {
  if (!enabled) {
    return;
  }

  if (revealDebugLastEventKey.get(item) === key) {
    return;
  }

  revealDebugLastEventKey.set(item, key);
  const history = revealDebugHistory.get(item) ?? [];
  history.push(entry);

  if (history.length > REVEAL_DEBUG_HISTORY_LIMIT) {
    history.splice(0, history.length - REVEAL_DEBUG_HISTORY_LIMIT);
  }

  revealDebugHistory.set(item, history);
  item.dataset.revealDebugHistory = history.join(" | ");
}

function appendRevealDebugEvent(
  item: HTMLElement,
  enabled: boolean,
  snapshot: RevealDebugSnapshot,
  key: string
) {
  if (!enabled) {
    return;
  }

  const store = getRevealDebugStore();
  if (!store) {
    return;
  }

  const itemId = item.dataset.revealDebugId ?? item.dataset.galleryIndex ?? "-";
  const tileIndex = item.dataset.galleryIndex ?? "-";
  const alt = item.dataset.galleryAlt ?? "";
  const src = item.dataset.gallerySrc ?? "";
  const existingEvents = store.byTile[tileIndex] ?? [];
  const existingItemEvents = store.byItem[itemId] ?? [];
  const lastEvent = existingEvents[existingEvents.length - 1];
  if (lastEvent && [
    lastEvent.surfaceLabel ?? "",
    lastEvent.itemId,
    lastEvent.phase ?? "",
    lastEvent.reason ?? "",
    formatDebugNumber(lastEvent.top, 0),
    formatDebugNumber(lastEvent.rawTop, 0),
    formatDebugNumber(lastEvent.computedOpacity, 2),
    formatDebugNumber(lastEvent.exitMaskStartPercent, 1),
    formatDebugNumber(lastEvent.visibleRatio, 2),
    formatDebugNumber(lastEvent.entryProgress, 2),
    formatDebugNumber(lastEvent.exitProgress, 2),
    formatDebugBoolean(lastEvent.visible),
    formatDebugBoolean(lastEvent.entryLocked),
    formatDebugBoolean(lastEvent.active),
    formatDebugBoolean(lastEvent.exiting),
    formatDebugBoolean(lastEvent.intersecting),
  ].join("|") === key) {
    return;
  }

  store.sequence += 1;
  const event: RevealDebugEventRecord = {
    ...snapshot,
    sessionId: store.sessionId,
    itemId,
    tileIndex,
    alt,
    src,
    pageSignature: store.pageSignature,
    sequence: store.sequence,
    timestampMs: typeof performance !== "undefined" ? performance.now() : Date.now(),
  };

  existingEvents.push(event);
  if (existingEvents.length > REVEAL_DEBUG_GLOBAL_LIMIT) {
    existingEvents.splice(0, existingEvents.length - REVEAL_DEBUG_GLOBAL_LIMIT);
  }
  store.byTile[tileIndex] = existingEvents;

  existingItemEvents.push(event);
  if (existingItemEvents.length > REVEAL_DEBUG_GLOBAL_LIMIT) {
    existingItemEvents.splice(0, existingItemEvents.length - REVEAL_DEBUG_GLOBAL_LIMIT);
  }
  store.byItem[itemId] = existingItemEvents;

  store.events.push(event);
  if (store.events.length > REVEAL_DEBUG_GLOBAL_LIMIT) {
    store.events.splice(0, store.events.length - REVEAL_DEBUG_GLOBAL_LIMIT);
  }
}

export function setRevealDebugSnapshot(
  item: HTMLElement,
  snapshot: RevealDebugSnapshot,
  enabled: boolean = isRevealDebugEnabled()
) {
  if (!enabled) {
    clearRevealDebugSnapshot(item);
    return;
  }

  item.dataset.revealDebugEnabled = "true";
  item.dataset.revealDebugPhase = snapshot.phase;
  item.dataset.revealDebugReason = snapshot.reason ?? "";
  item.dataset.revealDebugState = snapshot.state ?? "";
  const tileIndex = item.dataset.galleryIndex ?? "-";
  item.dataset.revealDebugSummary = [
    `tile ${tileIndex}`,
    `item ${item.dataset.revealDebugId ?? "-"}`,
    `surface ${snapshot.surfaceLabel ?? "-"}`,
    `${snapshot.phase}:${snapshot.reason ?? "-"}`,
    `state ${snapshot.state ?? "-"}`,
    `scroll ${formatDebugNumber(snapshot.scrollY, 0)}`,
    `top ${formatDebugNumber(snapshot.top, 1)} bottom ${formatDebugNumber(snapshot.bottom, 1)}`,
    `raw ${formatDebugNumber(snapshot.rawTop, 1)} -> ${formatDebugNumber(snapshot.translateY, 1)}`,
    `opacity ${formatDebugNumber(snapshot.computedOpacity)} mask ${formatDebugNumber(snapshot.exitMaskStartPercent)}`,
    `ratio ${formatDebugNumber(snapshot.visibleRatio)}`,
    `exit-anchor ${formatDebugNumber(snapshot.exitAnchorTop, 1)} gate ${formatDebugNumber(snapshot.exitVisibleRatioThresholdUsed)} ${snapshot.aspectMode ?? "-"}`,
    `entry ${formatDebugNumber(snapshot.entryProgress)}`,
    `exit ${formatDebugNumber(snapshot.exitProgress)}`,
    `visible ${formatDebugBoolean(snapshot.visible)} locked ${formatDebugBoolean(snapshot.entryLocked)}`,
    `active ${formatDebugBoolean(snapshot.active)}`,
    `armed ${formatDebugBoolean(snapshot.armed)} pending ${formatDebugBoolean(snapshot.pending)}`,
    `intersect ${formatDebugBoolean(snapshot.intersecting)} ratio ${formatDebugNumber(snapshot.intersectionRatio)} exiting ${formatDebugBoolean(snapshot.exiting)}`,
  ].join("\n");

  const historyEntry = [
    `tile:${tileIndex}`,
    `surface:${snapshot.surfaceLabel ?? "-"}`,
    snapshot.phase ?? "-",
    snapshot.reason ?? "-",
    `y:${formatDebugNumber(snapshot.scrollY, 0)}`,
    `t:${formatDebugNumber(snapshot.top, 0)}`,
    `raw:${formatDebugNumber(snapshot.rawTop, 0)}`,
    `ty:${formatDebugNumber(snapshot.translateY, 1)}`,
    `op:${formatDebugNumber(snapshot.computedOpacity, 2)}`,
    `mask:${formatDebugNumber(snapshot.exitMaskStartPercent, 1)}`,
    `r:${formatDebugNumber(snapshot.visibleRatio, 2)}`,
    `ea:${formatDebugNumber(snapshot.exitAnchorTop, 0)}`,
    `gate:${formatDebugNumber(snapshot.exitVisibleRatioThresholdUsed, 2)}`,
    `aspect:${snapshot.aspectMode ?? "-"}`,
    `en:${formatDebugNumber(snapshot.entryProgress, 2)}`,
    `ex:${formatDebugNumber(snapshot.exitProgress, 2)}`,
    `v:${formatDebugBoolean(snapshot.visible)}`,
    `lock:${formatDebugBoolean(snapshot.entryLocked)}`,
    `a:${formatDebugBoolean(snapshot.active)}`,
    `x:${formatDebugBoolean(snapshot.exiting)}`,
  ].join(" ");
  const historyKey = [
    snapshot.surfaceLabel ?? "",
    snapshot.phase ?? "",
    snapshot.reason ?? "",
    formatDebugNumber(snapshot.scrollY, 0),
    formatDebugNumber(snapshot.top, 0),
    formatDebugNumber(snapshot.rawTop, 0),
    formatDebugNumber(snapshot.translateY, 1),
    formatDebugNumber(snapshot.computedOpacity, 2),
    formatDebugNumber(snapshot.exitMaskStartPercent, 1),
    formatDebugNumber(snapshot.visibleRatio, 2),
    formatDebugNumber(snapshot.exitAnchorTop, 0),
    formatDebugNumber(snapshot.exitVisibleRatioThresholdUsed, 2),
    snapshot.aspectMode ?? "",
    formatDebugNumber(snapshot.entryProgress, 2),
    formatDebugNumber(snapshot.exitProgress, 2),
    formatDebugBoolean(snapshot.visible),
    formatDebugBoolean(snapshot.entryLocked),
    formatDebugBoolean(snapshot.active),
    formatDebugBoolean(snapshot.exiting),
    formatDebugBoolean(snapshot.intersecting),
  ].join("|");
  appendRevealDebugHistory(item, enabled, historyEntry, historyKey);
  appendRevealDebugEvent(item, enabled, snapshot, historyKey);
}
