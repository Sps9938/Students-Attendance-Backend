import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const uploadOnCloudinary = async(localFilePath) => {
    // console.log(localFilePath);
    
    try {
        if(!localFilePath) return null;
        const uploadResponse = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "raw"
        })
        // console.log(uploadResponse.url);
        
        fs.unlinkSync(localFilePath);
        // console.log("Public url", uploadResponse.secure_url);
        
        return uploadResponse;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export {
    uploadOnCloudinary
}