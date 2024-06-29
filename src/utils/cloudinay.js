import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinaryUploaad = async function (localFilePath) {
  try {
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: auto,
    });
    console.log("file uploaded successfully on cloudinary ", res.url);
    return res;
  } catch (error) {
    // remove the locally saved temporary file as the upload failed
    fs.unlinkSync(localFilePath);
    return null
  }
};
