"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const router = useRouter();

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

      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

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
        const generatedLink = `${window.location.origin}/file/${id}`;
        setLink(generatedLink);
        setPassword("");
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
              Upload a file, add optional password protection, and generate a
              secure share link.
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

          <div className="flex flex-col gap-2">
            <label className="label" htmlFor="password">
              Optional password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Add a passphrase"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

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
            Send this link to your recipient.
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
