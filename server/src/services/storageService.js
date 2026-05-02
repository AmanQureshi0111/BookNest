import fs from "fs";
import path from "path";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import { isCloudinaryStorage } from "../config/env.js";

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");

const ensureUploadDir = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

const resolveLocalFile = (filePath) => {
  const raw = String(filePath || "");
  const candidates = [
    raw,
    path.resolve(raw),
    path.join(uploadDir, raw),
    path.join(uploadDir, path.basename(raw))
  ];
  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) || null;
};

const buildFileName = (originalName = "book.pdf") => {
  const ext = path.extname(originalName) || ".pdf";
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
};

const uploadToCloudinary = (buffer, originalName) =>
  new Promise((resolve, reject) => {
    const fileName = buildFileName(originalName);
    const publicId = `booknest/books/${path.parse(fileName).name}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
        format: "pdf",
        overwrite: false
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed."));
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });

export const uploadPdfBuffer = async ({ buffer, originalName }) => {
  const fileName = buildFileName(originalName);

  if (!isCloudinaryStorage()) {
    ensureUploadDir();
    const absolute = path.join(uploadDir, fileName);
    fs.writeFileSync(absolute, buffer);
    return { filePath: fileName, fileUrl: null };
  }

  const uploadResult = await uploadToCloudinary(buffer, originalName);
  return { filePath: uploadResult.public_id, fileUrl: uploadResult.secure_url };
};

export const deleteStoredFile = async (filePath) => {
  if (!filePath) return;

  if (!isCloudinaryStorage()) {
    const resolved = resolveLocalFile(filePath);
    if (resolved) {
      fs.unlinkSync(resolved);
    }
    return;
  }

  await cloudinary.uploader.destroy(String(filePath), { resource_type: "raw" });
};

export const getPdfContent = async ({ filePath, fileUrl }) => {
  const localResolved = resolveLocalFile(filePath);
  if (localResolved) {
    return {
      stream: fs.createReadStream(path.resolve(localResolved)),
      contentType: "application/pdf"
    };
  }

  if (!isCloudinaryStorage()) {
    return null;
  }

  const resolvedUrl =
    fileUrl ||
    cloudinary.url(String(filePath), {
      resource_type: "raw",
      secure: true
    });

  const response = await fetch(resolvedUrl);
  if (!response.ok || !response.body) {
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  const stream = Readable.from(Buffer.from(arrayBuffer));
  return {
    stream,
    contentType: response.headers.get("content-type") || "application/pdf"
  };
};
