import SubCategoryModel from "../../models/subCategories/SubCategoryModel.js";
import cloudinary from "../../config/cloudinary.js";
import {clearCategoryCache} from "../category/AllCatergoryWithSubs.js";

export const CreateSubCategoryService = async (req, res) => {
    try {
        const role = req.headers['role'];
        const { name, categoryId } = req.body;

        if (role === "superadmin" || role === "admin") {

            if (!req.file) {
                return { status: "fail", message: "Image is required!" };
            }

            const subCategoryImage = req.file.path;

            // Upload image to Cloudinary
            const response = await cloudinary.uploader.upload(subCategoryImage, {
                folder: 'Tajir/subCategories',
            });

            // Save to DB
            const data = await SubCategoryModel.create({
                name,
                categoryId, // ✅ Add this line
                image: response.secure_url,
            });

            // ✅ Clear category cache after creating subcategory
            clearCategoryCache();

            return { status: "success", message: "Request Successful!", data };

        } else {
            return { status: "fail", message: "You are not authorized!" };
        }

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
