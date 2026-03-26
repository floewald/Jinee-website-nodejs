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
        {selectionMode ? "Cancel Select" : "Select"}
      </button>

      {selectionMode && (
        <>
          <button className="btn btn--ghost" onClick={onSelectAll}>
            Select All ({totalCount})
          </button>

          <button className="btn btn--ghost" onClick={onClearSelection}>
            Clear
          </button>

          <span className="selected-count" aria-live="polite">
            {selectedCount} selected
          </span>

          {selectedCount > 0 && (
            <button
              className="btn btn--primary download-button"
              onClick={onDownload}
            >
              Download ZIP ({selectedCount})
            </button>
          )}
        </>
      )}
    </div>
  );
}
