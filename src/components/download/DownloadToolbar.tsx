"use client";

import { useState } from "react";
import { cx } from "@/styled-system/css";
import {
  toolbarSelectIdle,
  toolbarChip,
  toolbarChipPrimary,
  selectionBar,
  selectionBarRule,
  selectionStatus,
} from "./download-styles";

interface DownloadToolbarProps {
  selectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  onToggleSelection: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDownload: () => void;
}

export default function DownloadToolbar({
  selectionMode,
  selectedCount,
  totalCount,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onDownload,
}: DownloadToolbarProps) {
  const [clearFlash, setClearFlash] = useState(false);
  const allSelected = selectedCount === totalCount && totalCount > 0;

  function handleToggleSelection() {
    if (selectionMode) {
      setClearFlash(false);
    }
    onToggleSelection();
  }

  function handleSelectAll() {
    setClearFlash(false);
    onSelectAll();
  }

  function handleClearSelection() {
    setClearFlash(true);
    onClearSelection();
    setTimeout(() => setClearFlash(false), 100);
  }

  // Idle: a single outline chip, rendered straight into <main> (no wrapper) so
  // that the sticky bar which replaces it can stick within the tall page.
  if (!selectionMode) {
    return (
      <button
        className={cx(toolbarChip, toolbarSelectIdle, "download-toggle")}
        aria-pressed={false}
        onClick={handleToggleSelection}
      >
        Select
      </button>
    );
  }

  // Selection mode: the contained bar takes over, and sticks just below the
  // fixed header as you scroll the gallery.
  return (
    <div className={cx(selectionBar, "download-toolbar")} role="group" aria-label="Photo selection">
      <button
        className={cx(toolbarChip, "download-toggle")}
        aria-pressed={true}
        onClick={handleToggleSelection}
      >
        Done
      </button>

      <span className={selectionBarRule} aria-hidden="true" />

      <span className={cx(selectionStatus, "selected-count")} aria-live="polite">
        {selectedCount} of {totalCount} selected
      </span>

      <button
        className={cx(toolbarChipPrimary, "download-button")}
        disabled={selectedCount === 0}
        onClick={onDownload}
      >
        Download
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1v8M3.5 6l3.5 3.5L10.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1 11h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <button
        className={cx(toolbarChip, allSelected && "active")}
        onClick={handleSelectAll}
      >
        All
      </button>

      <button
        className={cx(toolbarChip, clearFlash && "active")}
        onClick={handleClearSelection}
      >
        Clear
      </button>
    </div>
  );
}
