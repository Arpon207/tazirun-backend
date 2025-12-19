import {ObjectId} from "mongodb";
import BrandsModel from "../../models/brands/BrandsModel.js";
import cloudinary from "../../config/cloudinary.js";

export const BrandDeleteService = async (req, res) => {

    try{

        const id = new ObjectId(req.params['id']);

        const brand = await BrandsModel.findOne({ _id: id });

        if (!brand) {
            return { status: "fail", message: "Brand not found" };
        }

        // Extract the public ID from the image URL
        const imageUrl = brand.image;
        const parts = imageUrl.split('/');
        const publicIdWithExtension = parts[parts.length - 1]; // e.g., abc123.jpg
        const publicId = `Tajir/brands/${publicIdWithExtension.split('.')[0]}`; // e.g., Tajir/brands/abc123

        await cloudinary.uploader.destroy(publicId);

        await BrandsModel.deleteOne({_id: id});

        return { status: "success", message: "Delete successful!" };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}