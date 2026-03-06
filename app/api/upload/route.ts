import { NextResponse } from "next/server";
import { getCloudinary } from "../../../lib/cloudinary";
import { connectDB } from "../../../lib/db";
import FileModel from "../../../models/File";
import { UploadApiResponse } from "cloudinary";
import { getAuthPayload } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const auth = getAuthPayload(req);
    if (!auth) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const filenameValue = formData.get("filename");
    const filename =
      typeof filenameValue === "string" && filenameValue.trim()
        ? filenameValue.trim()
        : "secure-file";
    const ivValue = formData.get("iv");
    const iv = typeof ivValue === "string" ? ivValue : "";
    const contentTypeValue = formData.get("contentType");
    const contentType =
      typeof contentTypeValue === "string" && contentTypeValue.trim()
        ? contentTypeValue.trim()
        : "application/octet-stream";

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!iv) {
      return NextResponse.json(
        { message: "Missing encryption metadata." },
        { status: 400 }
      );
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "File exceeds 20MB limit." },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: UploadApiResponse = await new Promise(
      (resolve, reject) => {
        const stream = getCloudinary().uploader.upload_stream(
          { folder: "secureshare", resource_type: "raw" },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("Upload failed"));
          }
        );

        stream.end(buffer);
      }
    );

    const savedFile = await FileModel.create({
      filename,
      url: uploadResult.secure_url,
      ownerId: auth.id,
      iv,
      size: file.size,
      contentType,
    });

    return NextResponse.json({
      id: savedFile._id.toString(),
      filename: savedFile.filename,
      url: savedFile.url,
      passwordProtected: Boolean(savedFile.password),
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Upload failed" },
      { status: 500 }
    );
  }
}
