import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../../lib/db";
import FileModel from "../../../../../models/File";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const password =
      typeof body.password === "string" ? body.password.trim() : "";

    const file = await FileModel.findById(id);
    if (!file) {
      return NextResponse.json(
        { message: "File not found" },
        { status: 404 }
      );
    }

    if (file.password && file.password !== "") {
      if (!password) {
        return NextResponse.json(
          { message: "Password is required" },
          { status: 401 }
        );
      }

      const isMatch = await bcrypt.compare(password, file.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Invalid password" },
          { status: 401 }
        );
      }
    }

    const updated = await FileModel.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    return NextResponse.json({
      url: file.url,
      filename: file.filename,
      downloadCount: updated?.downloadCount ?? file.downloadCount + 1,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to process download" },
      { status: 500 }
    );
  }
}
