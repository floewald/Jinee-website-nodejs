"use client";

import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/lib/constants";

interface DownloadModalProps {
  isOpen: boolean;
  selectedFiles: string[];
  project: string;
  onClose: () => void;
}

export default function DownloadModal({
  isOpen,
  selectedFiles,
  project,
  onClose,
}: DownloadModalProps) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Reset form state when modal opens. Using setState in effect is correct
  // here: we need to reset when isOpen transitions from false→true.
  useEffect(() => {
    if (isOpen) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setPassword("");
      setStatus("idle");
      setErrorMessage("");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleDownload() {
    setStatus("loading");
    setErrorMessage("");

    try {
      const csrfRes = await fetch(`${BACKEND_URL}/contact/csrf-token.php`, {
        credentials: "include",
      });
      const { token } = await csrfRes.json();

      const formData = new FormData();
      formData.append("project", project);
      formData.append("password", password);
      formData.append("csrf_token", token);
      selectedFiles.forEach((f) => formData.append("files[]", f));

      const res = await fetch(`${BACKEND_URL}/download/download.php`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        if (json.status === "error") {
          setStatus("error");
          setErrorMessage(json.message ?? "Download failed.");
          return;
        }
      }

      // Binary response — trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("idle");
      onClose();
    } catch {
      setStatus("error");
      setErrorMessage("A network error occurred. Please try again.");
    }
  }

  return (
    <div className="download-modal is-open" aria-hidden="false">
      <div
        className="download-modal__backdrop"
        data-testid="download-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div role="dialog" aria-modal="true" className="download-modal__dialog">
        <header className="download-modal__header">
          <h3 className="download-modal__title">Download Selected Images</h3>
          <button
            className="download-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </header>

        <section className="download-modal__body">
          <p className="download-modal__info">
            You have selected{" "}
            <strong>{selectedFiles.length} image(s)</strong>.
            <br />
            Enter the password to download the original high-resolution files as a ZIP archive.
          </p>

          {status === "error" && (
            <div role="alert" className="download-modal__notice download-modal__notice--error">
              {errorMessage}
            </div>
          )}

          <div className="download-modal__password-wrapper">
            <label htmlFor="dm-password" className="sr-only">
              Password
            </label>
            <input
              id="dm-password"
              type={showPassword ? "text" : "password"}
              className="download-modal__input"
              placeholder="Enter download password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDownload();
              }}
            />
            <button
              type="button"
              className="download-modal__password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
              )}
            </button>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--large"
            disabled={status === "loading"}
            onClick={handleDownload}
          >
            {status === "loading" ? "Processing…" : "Download ZIP"}
          </button>
        </section>
      </div>
    </div>
  );
}
