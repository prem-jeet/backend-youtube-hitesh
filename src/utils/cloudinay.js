import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const cloudinaryUpload = async function (localFilePath) {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    
  });

  try {
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      overwrite:true
    });
    console.log("file uploaded successfully on cloudinary ", res.url);
    return res;
  } catch (error) {
    // remove the locally saved temporary file as the upload failed
    fs.unlinkSync(localFilePath);
    console.log("Cloudinary upload error : ", error);
    return null;
  }
};

export default cloudinaryUpload;
