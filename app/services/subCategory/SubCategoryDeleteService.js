import {ObjectId} from "mongodb";
import SubCategoryModel from "../../models/subCategories/SubCategoryModel.js";
import cloudinary from "../../config/cloudinary.js";
import {clearCategoryCache} from "../category/AllCatergoryWithSubs.js";

export const SubCategoryDeleteService = async (req, res) => {

    try{

        const id = new ObjectId(req.params['id']);

        const subCategory = await SubCategoryModel.findOne({ _id: id });

        if (!subCategory) {
            return { status: "fail", message: "Sub Category not found" };
        }

        // Extract the public ID from the image URL
        const imageUrl = subCategory.image;
        const parts = imageUrl.split('/');
        const publicIdWithExtension = parts[parts.length - 1]; // e.g., abc123.jpg
        const publicId = `Tajir/subCategories/${publicIdWithExtension.split('.')[0]}`; // e.g., Tajir/brands/abc123

        await cloudinary.uploader.destroy(publicId);

        await SubCategoryModel.deleteOne({_id: id});

        // ✅ Clear category cache after creating subcategory
        clearCategoryCache();

        return { status: "success", message: "Delete successful!" };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}