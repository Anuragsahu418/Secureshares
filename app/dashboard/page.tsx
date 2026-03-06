"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const router = useRouter();

  const b64UrlEncode = (bytes: Uint8Array) =>
    btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

  const toArrayBuffer = (bytes: Uint8Array) =>
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const uploadFile = async () => {
    setError("");
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      setLoading(true);

      const keyBytes = crypto.getRandomValues(new Uint8Array(32));
      const ivBytes = crypto.getRandomValues(new Uint8Array(12));
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        toArrayBuffer(keyBytes),
        { name: "AES-GCM" },
        false,
        ["encrypt"]
      );

      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: ivBytes },
        cryptoKey,
        await file.arrayBuffer()
      );

      const encryptedFile = new File(
        [new Uint8Array(encryptedBuffer)],
        "payload",
        { type: "application/octet-stream" }
      );

      const formData = new FormData();
      formData.append("file", encryptedFile);
      formData.append("filename", file.name);
      formData.append("contentType", file.type || "application/octet-stream");
      formData.append("iv", b64UrlEncode(ivBytes));

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to upload files.");
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        const id = data?.id ?? data?._id;
        if (!id) {
          setError("Upload succeeded but link could not be generated.");
          return;
        }
        const key = b64UrlEncode(keyBytes);
        const generatedLink = `${window.location.origin}/file/${id}#key=${key}`;
        setLink(generatedLink);
        setFile(null);
        setInputKey((prev) => prev + 1);
      } else {
        setError(data.message || "Upload failed.");
      }
    } catch (error) {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="label">Control Panel</p>
            <h1 className="text-2xl font-semibold text-green-200">
              SecureShare Dashboard
            </h1>
            <p className="text-sm text-green-200/70">
              Files are encrypted in your browser. Only someone with the full
              link can decrypt and download.
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost">
            Log Out
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <label className="label">File</label>
          <input
            key={inputKey}
            type="file"
            className="input"
            onChange={(e) =>
              setFile(e.target.files ? e.target.files[0] : null)
            }
          />

          {error && (
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
          )}

          <button
            onClick={uploadFile}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Encrypting..." : "Encrypt & Upload"}
          </button>
        </div>
      </div>

      {link && (
        <div className="card-soft text-center">
          <p className="text-green-200 font-semibold">
            Secure share link generated
          </p>
          <p className="mt-1 text-sm text-green-200/70">
            This link contains the decryption key. Store it safely.
          </p>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-center">
            <input value={link} readOnly className="input text-sm" />
            <button onClick={copyLink} className="btn btn-ghost">
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
