import CategoriesModel from "../../models/categories/CategoriesModel.js";
import cloudinary from "../../config/cloudinary.js";
import { ObjectId } from "mongodb";
import {clearCategoryCache} from "./AllCatergoryWithSubs.js";

export const UpdateCategoryService = async (req, res) => {
    try {
        const role = req.headers["role"];
        const id = new ObjectId(req.params.id);
        const { name } = req.body;

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        const existingCategory = await CategoriesModel.findById(id);
        if (!existingCategory) {
            return { status: "fail", message: "Category not found!" };
        }

        let updatedImageUrl = existingCategory.image;

        if (req.file) {
            // Step 1: Delete old image from Cloudinary
            if (existingCategory.image) {
                const imageUrl = existingCategory.image;
                const parts = imageUrl.split('/');
                const fileNameWithExt = parts[parts.length - 1]; // abc123.jpg
                const fileNameWithoutExt = fileNameWithExt.split('.')[0]; // abc123
                const publicId = `Tajir/categories/${fileNameWithoutExt}`; // Tajir/categories/abc123

                await cloudinary.uploader.destroy(publicId);
            }

            // Step 2: Upload new image
            const response = await cloudinary.uploader.upload(req.file.path, {
                folder: "Tajir/categories",
            });
            updatedImageUrl = response.secure_url;
        }

        const JsonBody = {
            name,
            image: updatedImageUrl,
        };

        const data = await CategoriesModel.updateOne({ _id: id }, { $set: JsonBody });

        // ✅ Clear category cache after update
        clearCategoryCache();

        return { status: "success", message: "Category updated!", data };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
