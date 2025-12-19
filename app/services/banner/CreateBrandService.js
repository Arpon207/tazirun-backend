import cloudinary from "../../config/cloudinary.js";
import BannerModel from "../../models/banner/BannerModel.js";

export const CreateBannerService = async (req, res) => {
    try {

        const role = req.headers['role'];

        if(role === "superadmin" || role === "admin"){

            // Check if an image file was uploaded
            if (!req.file) {
                return { status: "fail", message: "Image is required!" };
            }

            const bannerImage = req.file.path;

            // Store image into cloudinary
            const response = await cloudinary.uploader.upload(bannerImage, {
                folder: 'Tajir/banners',
            });

            const data = await BannerModel.create({
                image: response.secure_url,
            });

            return { status: "success", message: "Banner Created Successful!", data: data };


        }else {
            return { status: "fail", message: "You are not authorized!" };
        }


    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
}