import { connectDB } from "../../../lib/db";
import FileModel from "../../../models/File";
import DownloadPanel from "./DownloadPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getFile(id: string) {
  await connectDB();
  return FileModel.findById(id).lean();
}

export default async function FilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const file = await getFile(id);

  if (!file) {
    return (
      <div className="card text-center border-red-500/60">
        <h1 className="text-2xl font-bold text-red-300">File Not Found</h1>
      </div>
    );
  }

  const isProtected = Boolean(file.password);
  const fileId = file._id.toString();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="card">
        <p className="label">Secure File</p>
        <h1 className="mt-3 text-2xl font-semibold text-green-200">
          {file.filename}
        </h1>
        <p className="mt-2 text-sm text-green-200/70">
          {isProtected
            ? "This file is protected by a password."
            : "This file can be downloaded without a password."}
        </p>

        <DownloadPanel
          fileId={fileId}
          isProtected={isProtected}
          initialDownloads={file.downloadCount || 0}
        />
      </div>
    </div>
  );
}
