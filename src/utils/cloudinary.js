import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import fs from "fs";
import { ApiError } from "./ApiError.js";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (buffer, fileName = "report.pdf") => {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          public_id: `attendance_reports/${fileName}`, 
          use_filename: true,                       
          unique_filename:false,                     
          overwrite: true,                           
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );

      streamifier.createReadStream(buffer).pipe(stream);
    });
  } catch (error) {
    console.error("❌ Failed to upload on Cloudinary:", error);
    throw error;
  }
};

// const uploadOnCloudinary = async(localFilePath) => {
//     // console.log(localFilePath);
    
//     try {
//         if(!localFilePath) return null;
//         const uploadResponse = await cloudinary.uploader.upload(localFilePath,{
//             resource_type: "raw"
//         })
//         // console.log(uploadResponse.url);
        
//         fs.unlinkSync(localFilePath);
//         // console.log("Public url", uploadResponse.secure_url);
        
//         return uploadResponse;
//     } catch (error) {
//         fs.unlinkSync(localFilePath)
//         return null;
//     }
// }

export {
    uploadOnCloudinary
}