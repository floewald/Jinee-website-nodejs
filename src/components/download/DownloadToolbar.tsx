"use client";

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
  return (
    <div className="download-toolbar">
      <button
        className={`download-toggle btn btn--outline${selectionMode ? " is-active" : ""}`}
        aria-pressed={selectionMode}
        onClick={onToggleSelection}
      >
        Select
      </button>

      {selectionMode && (
        <>
          <button
            className="btn btn--primary download-button"
            disabled={selectedCount === 0}
            onClick={onDownload}
          >
            Download
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ marginLeft: "6px" }}>
              <path d="M7 1v8M3.5 6l3.5 3.5L10.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 11h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>

          <span className="toolbar-divider" aria-hidden="true" />

          <span className="selected-count selected-count--badge" aria-live="polite">
            {selectedCount} selected
          </span>

          <button className="btn btn--outline" onClick={onSelectAll}>
            All
          </button>

          <button className="btn btn--outline" onClick={onClearSelection}>
            Clear
          </button>
        </>
      )}
    </div>
  );
}
