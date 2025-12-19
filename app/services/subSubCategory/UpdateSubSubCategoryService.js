import SubSubCategoryModel from "../../models/subSubCategories/SubSubCategoryModel.js";
import cloudinary from "../../config/cloudinary.js";
import { ObjectId } from "mongodb";
import {clearCategoryCache} from "../category/AllCatergoryWithSubs.js";

export const UpdateSubSubCategoryService = async (req, res) => {
    try {
        const role = req.headers["role"];
        const id = new ObjectId(req.params.id);
        const { name, subCategoryId } = req.body;

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        const existingSubSubCategory = await SubSubCategoryModel.findById(id);
        if (!existingSubSubCategory) {
            return { status: "fail", message: "Sub-Category not found!" };
        }

        let updatedImageUrl = existingSubSubCategory.image;

        if (req.file) {

            // Step 1: Delete old image from Cloudinary
            if (existingSubSubCategory.image) {
                const imageUrl = existingSubSubCategory.image;
                const parts = imageUrl.split('/');
                const fileNameWithExt = parts[parts.length - 1]; // abc123.jpg
                const fileNameWithoutExt = fileNameWithExt.split('.')[0]; // abc123
                const publicId = `Tajir/subsubCategories/${fileNameWithoutExt}`;

                await cloudinary.uploader.destroy(publicId);
            }

            // Step 2: Upload new image
            const response = await cloudinary.uploader.upload(req.file.path, {
                folder: 'Tajir/subsubCategories',
            });
            updatedImageUrl = response.secure_url;
        }

        const JsonBody = {
            name,
            subCategoryId,
            image: updatedImageUrl,
        };

        const data = await SubSubCategoryModel.updateOne({ _id: id }, { $set: JsonBody });

        // ✅ Clear category cache after creating subsubcategory
        clearCategoryCache();

        return { status: "success", message: "Sub-category updated!", data };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
