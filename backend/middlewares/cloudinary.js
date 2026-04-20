import { v2 as cloudinary } from "cloudinary";

// configure using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * upload buffer or local file to Cloudinary
 * @param {Buffer|string} source  - buffer or file path
 * @param {object} options        - cloudinary upload options
 * @returns {Promise<object>}     - upload result
 */
export const uploadToCloudinary = (source, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(source);
  });
};

export default cloudinary;
