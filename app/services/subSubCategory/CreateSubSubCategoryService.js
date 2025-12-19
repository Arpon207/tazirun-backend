import SubSubCategoryModel from "../../models/subSubCategories/SubSubCategoryModel.js";
import cloudinary from "../../config/cloudinary.js";
import {clearCategoryCache} from "../category/AllCatergoryWithSubs.js";

export const CreateSubSubCategoryService = async (req, res) => {
    try {
        const role = req.headers['role'];
        const { name, subCategoryId } = req.body;

        if (role === "superadmin" || role === "admin") {

            if (!req.file) {
                return { status: "fail", message: "Image is required!" };
            }

            const subsubCategoryImage = req.file.path;

            // Upload image to Cloudinary
            const response = await cloudinary.uploader.upload(subsubCategoryImage, {
                folder: 'Tajir/subsubCategories',
            });

            // Save to DB
            const data = await SubSubCategoryModel.create({
                name,
                subCategoryId,
                image: response.secure_url,
            });

            // ✅ Clear category cache after creating subsubcategory
            clearCategoryCache();

            return { status: "success", message: "Request Successful!", data };

        } else {
            return { status: "fail", message: "You are not authorized!" };
        }

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
