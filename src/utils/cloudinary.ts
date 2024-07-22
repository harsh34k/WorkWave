import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const deletefile = async (public_id: string[]) => {
    await cloudinary.api.delete_resources(public_id, { type: 'upload', resource_type: 'auto' });
}


const uploadOnCloudinary = async (localFilePath: string): Promise<UploadApiResponse | null> => {
    try {
        console.log("in uploadOnCloudinary");

        if (!localFilePath) return null;
        console.log("localpath", localFilePath);


        // Upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        console.log("response", response);


        // File has been uploaded successfully
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file

        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload operation failed
        return null;
    }
}

export { uploadOnCloudinary };