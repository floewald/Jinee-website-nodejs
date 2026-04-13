"use client";

import { useState } from "react";
import { cx } from "@/styled-system/css";
import { btn } from "@/lib/button-styles";
import {
  downloadToolbar,
  toolbarBtn,
  selectedCountBadge,
  toolbarPipe,
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

  return (
    <div className={cx(downloadToolbar, "download-toolbar")}>
      <button
        className={cx(toolbarBtn, `download-toggle ${btn({ visual: "outline", active: selectionMode || undefined })}`)}
        aria-pressed={selectionMode}
        onClick={handleToggleSelection}
      >
        Select
      </button>

      {selectionMode && (
        <>
          <button
            className={cx(toolbarBtn, `${btn({ visual: "primary" })} download-button`)}
            disabled={selectedCount === 0}
            onClick={onDownload}
          >
            Download
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ marginLeft: "6px" }}>
              <path d="M7 1v8M3.5 6l3.5 3.5L10.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 11h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>

          <span className={cx(toolbarPipe, "toolbar-pipe")} aria-hidden="true">|</span>

          <span className={cx(selectedCountBadge, "selected-count", "selected-count--badge")} aria-live="polite">
            {selectedCount} selected
          </span>

          <button
            className={btn({ visual: "outline", active: allSelected || undefined })}
            onClick={handleSelectAll}
          >
            All
          </button>

          <button
            className={btn({ visual: "outline", active: clearFlash || undefined })}
            onClick={handleClearSelection}
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}
