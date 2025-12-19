import {ObjectId} from "mongodb";
import cloudinary from "../../config/cloudinary.js";
import BannerModel from "../../models/banner/BannerModel.js";

export const BannerDeleteService = async (req, res) => {

    try{

        const id = new ObjectId(req.params['id']);

        const banner = await BannerModel.findOne({ _id: id });

        if (!banner) {
            return { status: "fail", message: "Banner not found" };
        }

        // Extract the public ID from the image URL
        const imageUrl = banner.image;
        const parts = imageUrl.split('/');
        const publicIdWithExtension = parts[parts.length - 1]; // e.g., abc123.jpg
        const publicId = `Tajir/banners/${publicIdWithExtension.split('.')[0]}`; // e.g., Tajir/brands/abc123

        await cloudinary.uploader.destroy(publicId);

        await BannerModel.deleteOne({_id: id});

        return { status: "success", message: "Banner Deleted successful!" };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}