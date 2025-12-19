import SliderModel from "../../models/slider/SliderModel.js";
import cloudinary from "../../config/cloudinary.js";
import { ObjectId } from "mongodb";

export const UpdateSliderService = async (req, res) => {
    try {
        const role = req.headers["role"];
        const id = new ObjectId(req.params.id);
        const { productId, title, shortDes, isActive } = req.body;

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        const existingSlider = await SliderModel.findById(id);
        if (!existingSlider) {
            return { status: "fail", message: "Slider not found!" };
        }

        let updatedImageUrl = existingSlider.image;

        if (req.file) {
            // Step 1: Delete old image from Cloudinary
            if (existingSlider.image) {
                const imageUrl = existingSlider.image;
                const parts = imageUrl.split('/');
                const fileNameWithExt = parts[parts.length - 1];
                const fileNameWithoutExt = fileNameWithExt.split('.')[0];
                const publicId = `Tajir/sliders/${fileNameWithoutExt}`;

                await cloudinary.uploader.destroy(publicId);
            }

            // Step 2: Upload new image
            const response = await cloudinary.uploader.upload(req.file.path, {
                folder: "Tajir/sliders",
            });
            updatedImageUrl = response.secure_url;
        }

        const JsonBody = {
            productId,
            title,
            shortDes,
            isActive,
            image: updatedImageUrl,
        };

        const data = await SliderModel.updateOne({ _id: id }, { $set: JsonBody });

        return { status: "success", message: "Slider updated successfully!", data };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
