import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_API, CLOUDINARY_NAME, CLOUDINARY_SECRET_KEY } from "./config.js";

// Configuration
cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API,
    api_secret: CLOUDINARY_SECRET_KEY
});

export default cloudinary; // Export the cloudinary instance