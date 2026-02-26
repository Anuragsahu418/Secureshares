import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    password: String, // password hash (optional)
    size: Number,
    contentType: String,
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.File ||
  mongoose.model("File", FileSchema);
