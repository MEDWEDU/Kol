import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import multer from 'multer';

import { HttpError } from '../utils/HttpError';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function getUploadDirAbsolute() {
  const relativeDir = process.env.UPLOAD_DIR ?? 'uploads';
  return path.resolve(process.cwd(), relativeDir);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = getUploadDirAbsolute();
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${crypto.randomUUID()}${ext}`);
  },
});

export const avatarUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new HttpError(400, 'Only JPG, PNG or WEBP images are allowed'));
    }
    cb(null, true);
  },
}).single('avatar');

export function buildAvatarUrl(filename: string) {
  return `/uploads/${filename}`;
}
