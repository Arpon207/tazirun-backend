import {ObjectId} from "mongodb";
import SliderModel from "../../models/slider/SliderModel.js";
import cloudinary from "../../config/cloudinary.js";

export const DeleteSliderService = async (req, res) => {

    try{

        const id = new ObjectId(req.params['id']);

        const slider = await SliderModel.findOne({ _id: id });

        if (!slider) {
            return { status: "fail", message: "Slider not found" };
        }

        // Extract the public ID from the image URL
        const imageUrl = slider.image;
        const parts = imageUrl.split('/');
        const publicIdWithExtension = parts[parts.length - 1]; // e.g., abc123.jpg
        const publicId = `Tajir/sliders/${publicIdWithExtension.split('.')[0]}`; // e.g., Tajir/brands/abc123

        await cloudinary.uploader.destroy(publicId);

        await SliderModel.deleteOne({_id: id});

        return { status: "success", message: "Delete successful!" };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}