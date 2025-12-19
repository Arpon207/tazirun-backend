import SliderModel from "../../models/slider/SliderModel.js";
import cloudinary from "../../config/cloudinary.js";

export const CreateSliderService = async (req, res) => {
    try {

        const role = req.headers['role'];
        const { productId, title, shortDes, isActive } = req.body;

        if(role === "superadmin" || role === "admin"){

            // Check if an image file was uploaded
            if (!req.file) {
                return { status: "fail", message: "Image is required!" };
            }

            const sliderImage = req.file.path;

            // Store image into cloudinary
            const response = await cloudinary.uploader.upload(sliderImage, {
                folder: 'Tajir/sliders',
            });

            const data = await SliderModel.create({
                productId,
                title,
                shortDes,
                isActive,
                image: response.secure_url,
            });

            return { status: "success", message: "Request Successful!", data: data };


        }else {
            return { status: "fail", message: "You are not authorized!" };
        }


    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
}