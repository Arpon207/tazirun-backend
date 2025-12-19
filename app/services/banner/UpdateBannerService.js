import cloudinary from "../../config/cloudinary.js";
import { ObjectId } from "mongodb";
import BannerModel from "../../models/banner/BannerModel.js";

export const UpdateBannerService = async (req, res) => {
    try {
        const role = req.headers["role"];
        const id = new ObjectId(req.params.id);

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        const existingBanner = await BannerModel.findById(id);
        if (!existingBanner) {
            return { status: "fail", message: "Banner not found!" };
        }

        let updatedImageUrl = existingBanner.image;

        if (req.file) {
            // Step 1: Delete old image from Cloudinary
            if (existingBanner.image) {
                const imageUrl = existingBanner.image;
                const parts = imageUrl.split('/');
                const fileNameWithExt = parts[parts.length - 1]; // abc123.jpg
                const fileNameWithoutExt = fileNameWithExt.split('.')[0]; // abc123
                const publicId = `Tajir/banners/${fileNameWithoutExt}`;

                await cloudinary.uploader.destroy(publicId);
            }

            // Step 2: Upload new image
            const response = await cloudinary.uploader.upload(req.file.path, {
                folder: "Tajir/banners",
            });
            updatedImageUrl = response.secure_url;
        }

        const JsonBody = {
            image: updatedImageUrl,
        };

        const data = await BannerModel.updateOne({ _id: id }, { $set: JsonBody });

        return { status: "success", message: "Banner updated successfully!", data };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
