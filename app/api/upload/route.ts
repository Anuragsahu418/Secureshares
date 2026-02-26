import { NextResponse } from "next/server";
import cloudinary from "../../../lib/cloudinary";
import { connectDB } from "../../../lib/db";
import FileModel from "../../../models/File";
import bcrypt from "bcryptjs";
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
    const passwordValue = formData.get("password");
    const password = typeof passwordValue === "string" ? passwordValue : "";

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { message: "No file uploaded" },
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
        const stream = cloudinary.uploader.upload_stream(
          { folder: "secureshare", resource_type: "auto" },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("Upload failed"));
          }
        );

        stream.end(buffer);
      }
    );

    let hashedPassword = "";

    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const savedFile = await FileModel.create({
      filename: uploadResult.original_filename,
      url: uploadResult.secure_url,
      ownerId: auth.id,
      password: hashedPassword,
      size: file.size,
      contentType: file.type,
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
