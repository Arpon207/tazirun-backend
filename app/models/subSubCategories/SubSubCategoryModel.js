import mongoose from 'mongoose';
import {ALL_DEFAULT_IMAGE} from "../../config/config.js";

const DataSchema = new mongoose.Schema(
    {
        subCategoryId: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String, required: true },
        image: { type: String, default: ALL_DEFAULT_IMAGE},
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const SubSubCategoryModel = mongoose.model('subSubCategory', DataSchema);

export default SubSubCategoryModel;