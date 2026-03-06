"use client";

import { useEffect, useState } from "react";

type DownloadPanelProps = {
  fileId: string;
  initialDownloads: number;
};

export default function DownloadPanel({
  fileId,
  initialDownloads,
}: DownloadPanelProps) {
  const [keyBytes, setKeyBytes] = useState<Uint8Array | null>(null);
  const [downloads, setDownloads] = useState(initialDownloads);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const b64UrlDecode = (value: string) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  };

  const toArrayBuffer = (bytes: Uint8Array) =>
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/key=([^&]+)/);
    if (match?.[1]) {
      try {
        setKeyBytes(b64UrlDecode(match[1]));
      } catch (err) {
        setError("Invalid decryption key in link.");
      }
    }
  }, []);

  const handleDownload = async () => {
    setError("");
    setLoading(true);

    try {
      if (!keyBytes) {
        setError("Missing decryption key. Use the full secure link.");
        return;
      }

      const res = await fetch(`/api/file/${fileId}/download`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to download this file.");
        return;
      }

      const encryptedRes = await fetch(data.url);
      if (!encryptedRes.ok) {
        setError("Unable to retrieve encrypted file.");
        return;
      }

      const encryptedBuffer = await encryptedRes.arrayBuffer();
      const ivBytes = b64UrlDecode(data.iv);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        toArrayBuffer(keyBytes),
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes },
        cryptoKey,
        encryptedBuffer
      );

      const blob = new Blob([new Uint8Array(decryptedBuffer)], {
        type: data.contentType || "application/octet-stream",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename || "secure-file";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setDownloads(data.downloadCount ?? downloads);
    } catch (err) {
      setError("Unable to decrypt. Check the link key and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      {!keyBytes && (
        <p className="text-sm text-yellow-300">
          Missing decryption key. Make sure you opened the full secure link.
        </p>
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
        disabled={loading || !keyBytes}
      >
        {loading ? "Preparing download..." : "Download Secure File"}
      </button>

      <p className="text-sm text-green-200/70">
        Total downloads: {downloads}
      </p>
    </div>
  );
}
