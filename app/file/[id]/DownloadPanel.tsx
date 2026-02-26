"use client";

import { useState } from "react";

type DownloadPanelProps = {
  fileId: string;
  isProtected: boolean;
  initialDownloads: number;
};

export default function DownloadPanel({
  fileId,
  isProtected,
  initialDownloads,
}: DownloadPanelProps) {
  const [password, setPassword] = useState("");
  const [downloads, setDownloads] = useState(initialDownloads);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/file/${fileId}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: isProtected ? password : "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to download this file.");
        return;
      }

      setDownloads(data.downloadCount ?? downloads);
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError("Unable to download. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      {isProtected && (
        <div className="flex flex-col gap-2">
          <label className="label" htmlFor="file-password">
            Password required
          </label>
          <input
            id="file-password"
            type="password"
            className="input"
            placeholder="Enter file password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        className="btn btn-primary w-full"
        onClick={handleDownload}
        disabled={loading || (isProtected && !password.trim())}
      >
        {loading ? "Preparing download..." : "Download Secure File"}
      </button>

      <p className="text-sm text-green-200/70">
        Total downloads: {downloads}
      </p>
    </div>
  );
}
