import {ObjectId} from "mongodb";
import CategoriesModel from "../../models/categories/CategoriesModel.js";
import cloudinary from "../../config/cloudinary.js";
import {clearCategoryCache} from "./AllCatergoryWithSubs.js";

export const CategoryDeleteService = async (req, res) => {

    try{

        const id = new ObjectId(req.params['id']);

        const category = await CategoriesModel.findOne({ _id: id });

        if (!category) {
            return { status: "fail", message: "Category not found" };
        }

        // Extract the public ID from the image URL
        const imageUrl = category.image;
        const parts = imageUrl.split('/');
        const publicIdWithExtension = parts[parts.length - 1]; // e.g., abc123.jpg
        const publicId = `Tajir/categories/${publicIdWithExtension.split('.')[0]}`; // e.g., Tajir/brands/abc123

        await cloudinary.uploader.destroy(publicId);

        await CategoriesModel.deleteOne({_id: id});

        // ✅ Clear category cache after deletion
        clearCategoryCache();

        return { status: "success", message: "Delete successful!" };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}