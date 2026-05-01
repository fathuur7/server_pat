import multer from 'multer';
import path from 'path';

// Storage router: video → uploads/raw, thumbnail → uploads/thumbnails
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      cb(null, path.join(__dirname, '../../uploads/thumbnails/'));
    } else {
      cb(null, path.join(__dirname, '../../uploads/raw/'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Allow video files and image files (for thumbnail)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'thumbnail') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Thumbnail must be an image file (jpg, png, webp).'));
    }
  } else {
    // Allow video mimetypes and some fallbacks for .mkv
    if (file.mimetype.startsWith('video/') || 
        file.mimetype === 'application/x-matroska' || 
        file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Not a video! Please upload only video files.'));
    }
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB limit (for video)
  }
});
