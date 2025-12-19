import BrandsModel from "../../models/brands/BrandsModel.js";
import cloudinary from "../../config/cloudinary.js";
import { ObjectId } from "mongodb";

export const UpdateBrandService = async (req, res) => {
    try {
        const role = req.headers["role"];
        const id = new ObjectId(req.params.id);
        const { name } = req.body;

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        const existingBrand = await BrandsModel.findById(id);
        if (!existingBrand) {
            return { status: "fail", message: "Brand not found!" };
        }

        let updatedImageUrl = existingBrand.image;

        if (req.file) {
            // Step 1: Delete old image from Cloudinary
            if (existingBrand.image) {
                const imageUrl = existingBrand.image;
                const parts = imageUrl.split('/');
                const fileNameWithExt = parts[parts.length - 1]; // abc123.jpg
                const fileNameWithoutExt = fileNameWithExt.split('.')[0]; // abc123
                const publicId = `Tajir/brands/${fileNameWithoutExt}`;

                await cloudinary.uploader.destroy(publicId);
            }

            // Step 2: Upload new image
            const response = await cloudinary.uploader.upload(req.file.path, {
                folder: "Tajir/brands",
            });
            updatedImageUrl = response.secure_url;
        }

        const JsonBody = {
            name,
            image: updatedImageUrl,
        };

        const data = await BrandsModel.updateOne({ _id: id }, { $set: JsonBody });

        return { status: "success", message: "Brand updated successfully!", data };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
