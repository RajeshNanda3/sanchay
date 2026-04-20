import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


// Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });



    const uploadOnCloudinary = async (filePath) => {
     try {
          if (!filePath) return null;
         const result = await cloudinary.uploader.upload(filePath, {
              resource_type: "auto",
              folder: "uploads",
              use_filename: true,
              unique_filename: false,
          });
          console.log("Upload successful:", result);
          return result.secure_url;
      } catch (error) {
          fs.unlink(filePath)
          console.error("Upload failed:", error);
          throw error;
      }
  };


export {uploadOnCloudinary}