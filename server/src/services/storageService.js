import fs from "fs";
import path from "path";
import { Readable } from "stream";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { isS3Storage } from "../config/env.js";

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");

const ensureUploadDir = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

const buildFileName = (originalName = "book.pdf") => {
  const ext = path.extname(originalName) || ".pdf";
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
};

const getS3Client = () =>
  new S3Client({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
  });

export const uploadPdfBuffer = async ({ buffer, originalName, mimetype }) => {
  const fileName = buildFileName(originalName);

  if (!isS3Storage()) {
    ensureUploadDir();
    const absolute = path.join(uploadDir, fileName);
    fs.writeFileSync(absolute, buffer);
    return { filePath: fileName };
  }

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `books/${fileName}`,
      Body: buffer,
      ContentType: mimetype || "application/pdf"
    })
  );
  return { filePath: `books/${fileName}` };
};

export const deleteStoredFile = async (filePath) => {
  if (!filePath) return;

  if (!isS3Storage()) {
    const candidates = [
      filePath,
      path.resolve(filePath),
      path.join(uploadDir, filePath),
      path.join(uploadDir, path.basename(filePath))
    ];
    const resolved = candidates.find((candidate) => candidate && fs.existsSync(candidate));
    if (resolved) {
      fs.unlinkSync(resolved);
    }
    return;
  }

  const key = String(filePath).replace(/^\/+/, "");
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    })
  );
};

export const getPdfContent = async (filePath) => {
  if (!isS3Storage()) {
    const candidates = [
      filePath,
      path.resolve(filePath),
      path.join(uploadDir, filePath),
      path.join(uploadDir, path.basename(filePath))
    ];
    const resolved = candidates.find((candidate) => candidate && fs.existsSync(candidate));
    if (!resolved) return null;

    return {
      stream: fs.createReadStream(path.resolve(resolved)),
      contentType: "application/pdf"
    };
  }

  const key = String(filePath).replace(/^\/+/, "");
  const client = getS3Client();
  const obj = await client.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    })
  );

  if (!obj.Body) return null;
  const stream = obj.Body instanceof Readable ? obj.Body : Readable.fromWeb(obj.Body);
  return {
    stream,
    contentType: obj.ContentType || "application/pdf"
  };
};
