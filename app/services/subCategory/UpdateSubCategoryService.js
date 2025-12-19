import SubCategoryModel from "../../models/subCategories/SubCategoryModel.js";
import cloudinary from "../../config/cloudinary.js";
import { ObjectId } from "mongodb";
import {clearCategoryCache} from "../category/AllCatergoryWithSubs.js";

export const UpdateSubCategoryService = async (req, res) => {
    try {
        const role = req.headers["role"];
        const id = new ObjectId(req.params.id);
        const { name, categoryId } = req.body;

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        const existingSubCategory = await SubCategoryModel.findById(id);
        if (!existingSubCategory) {
            return { status: "fail", message: "Sub-Category not found!" };
        }

        let updatedImageUrl = existingSubCategory.image;

        if (req.file) {
            // Step 1: Delete old image from Cloudinary
            if (existingSubCategory.image) {
                const imageUrl = existingSubCategory.image;
                const parts = imageUrl.split('/');
                const fileNameWithExt = parts[parts.length - 1]; // abc123.jpg
                const fileNameWithoutExt = fileNameWithExt.split('.')[0]; // abc123
                const publicId = `Tajir/subCategories/${fileNameWithoutExt}`;

                await cloudinary.uploader.destroy(publicId);
            }

            // Step 2: Upload new image
            const response = await cloudinary.uploader.upload(req.file.path, {
                folder: 'Tajir/subCategories',
            });
            updatedImageUrl = response.secure_url;
        }

        // ✅ Include categoryId in the update
        const JsonBody = {
            name,
            categoryId,
            image: updatedImageUrl,
        };

        const data = await SubCategoryModel.updateOne({ _id: id }, { $set: JsonBody });

        // ✅ Clear category cache after creating subcategory
        clearCategoryCache();

        return { status: "success", message: "Sub-category updated!", data };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
