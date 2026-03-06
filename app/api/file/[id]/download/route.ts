import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import FileModel from "../../../../../models/File";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const file = await FileModel.findById(id);
    if (!file) {
      return NextResponse.json(
        { message: "File not found" },
        { status: 404 }
      );
    }

    if (!file.iv) {
      return NextResponse.json(
        { message: "Missing encryption metadata." },
        { status: 400 }
      );
    }

    const updated = await FileModel.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    return NextResponse.json({
      url: file.url,
      filename: file.filename,
      iv: file.iv,
      contentType: file.contentType || "application/octet-stream",
      downloadCount: updated?.downloadCount ?? file.downloadCount + 1,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to process download" },
      { status: 500 }
    );
  }
}
