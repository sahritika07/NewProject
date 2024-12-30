import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error("No file path provided");
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detect the file type
        });

        console.log("File is uploaded on Cloudinary");
        return response;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message);

        // Check if the file exists before trying to delete it
        if (fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
                console.log("Temporary file deleted successfully");
            } catch (unlinkError) {
                console.error("Error deleting temporary file:", unlinkError.message);
            }
        }
        return null;
    }
};

export default uploadOnCloudinary;
