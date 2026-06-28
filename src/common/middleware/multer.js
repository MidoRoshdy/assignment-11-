import multer from "multer";
import path from "path";
import fs from "fs";
import { BadRequestException } from "../utils/apiError.js";

const uploadsDir = path.resolve("uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const pickUploadedFile = (req) => {
  return (
    req.files?.profileImage?.[0] || req.files?.image?.[0] || req.file || null
  );
};

export const uploadImage = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";

  if (!contentType.includes("multipart/form-data")) {
    return next();
  }

  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_UNEXPECTED_FILE"
          ? "Use profileImage or image as the file field name"
          : err.message;

      return next(new BadRequestException(message));
    }

    req.file = pickUploadedFile(req);
    next();
  });
};

export const buildImageUrl = (req, filename) => {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};
