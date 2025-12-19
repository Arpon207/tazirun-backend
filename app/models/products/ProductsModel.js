import mongoose from 'mongoose';
import {ALL_DEFAULT_IMAGE} from "../../config/config.js";

const DataSchema = new mongoose.Schema(
    {
        campaignId: { type: mongoose.Schema.Types.ObjectId, default: null },
        brandId: { type: mongoose.Schema.Types.ObjectId, default: null },
        categoryId: { type: mongoose.Schema.Types.ObjectId, default: null },
        subCategoryId: { type: mongoose.Schema.Types.ObjectId, default: null },
        subSubCategoryId: { type: mongoose.Schema.Types.ObjectId, default: null },
        name: { type: String, required: true },
        price: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        discountPrice: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        remark: { type: String },
        catName: { type: String },
        unit: { type: String, required: true },
        videoUrl: { type: String },
        details: { type: String, required: true },
        specification: { type: String },
        image: { type: String, default: ALL_DEFAULT_IMAGE},
        hoverImage: { type: String, default: ALL_DEFAULT_IMAGE},
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ProductsModel = mongoose.model('product', DataSchema);
export default ProductsModel;