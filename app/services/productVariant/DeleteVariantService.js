import {ObjectId} from "mongodb";
import cloudinary from "../../config/cloudinary.js";
import ProductVariantModel from "../../models/productVariant/ProductVariantModel.js";

export const DeleteVariantService = async (req, res) => {

    try{

        const id = new ObjectId(req.params['id']);

        const variant = await ProductVariantModel.findOne({ _id: id });

        if (!variant) {
            return { status: "fail", message: "Variant not found" };
        }

        // Extract the public ID from the image URL
        const imageUrl = variant.image;
        const parts = imageUrl.split('/');
        const publicIdWithExtension = parts[parts.length - 1]; // e.g., abc123.jpg
        const publicId = `Tajir/productVariant/${publicIdWithExtension.split('.')[0]}`; // e.g., Tajir/brands/abc123

        await cloudinary.uploader.destroy(publicId);

        await ProductVariantModel.deleteOne({_id: id});

        return { status: "success", message: "Delete successful!" };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}