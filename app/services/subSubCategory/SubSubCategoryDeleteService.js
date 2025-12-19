import {ObjectId} from "mongodb";
import SubSubCategoryModel from "../../models/subSubCategories/SubSubCategoryModel.js";
import cloudinary from "../../config/cloudinary.js";
import {clearCategoryCache} from "../category/AllCatergoryWithSubs.js";

export const SubSubCategoryDeleteService = async (req, res) => {

    try{

        const id = new ObjectId(req.params['id']);

        const subsubCategory = await SubSubCategoryModel.findOne({ _id: id });

        if (!subsubCategory) {
            return { status: "fail", message: "Sub sub-Category not found" };
        }

        // Extract the public ID from the image URL
        const imageUrl = subsubCategory.image;
        const parts = imageUrl.split('/');
        const publicIdWithExtension = parts[parts.length - 1]; // e.g., abc123.jpg
        const publicId = `Tajir/subsubCategories/${publicIdWithExtension.split('.')[0]}`; // e.g., Tajir/brands/abc123

        await cloudinary.uploader.destroy(publicId);

        await SubSubCategoryModel.deleteOne({_id: id});

        // ✅ Clear category cache after creating subsubcategory
        clearCategoryCache();

        return { status: "success", message: "Delete successful!" };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}