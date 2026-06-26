import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { ApiError } from '../utils/apiError';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedImages = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const allowedVideos = ['.mp4', '.mov', '.avi', '.webm'];
  const allowedDocs = ['.pdf', '.doc', '.docx', '.xlsx', '.csv'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedImages.includes(ext) ||
    allowedVideos.includes(ext) ||
    allowedDocs.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. الأنواع المدعومة: صور، فيديو، PDF, Excel, CSV'));
  }
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
}).single('image');

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize * 4, // 20MB for videos
  },
}).single('video');

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10,
  },
}).array('files', 10);

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
}).single('file');
