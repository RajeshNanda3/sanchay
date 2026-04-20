import multer from "multer";
import path from "path";

// use memory storage so that we can pipe directly to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.random().toString(36).substr(2, 9) + ext);
  },
});

// accept only images (jpeg, png, webp)
const fileFilter = (req, file, cb) => {
  console.log(file.mimetype)
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"), false);
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});