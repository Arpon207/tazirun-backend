import mongoose from 'mongoose';
import {ALL_DEFAULT_IMAGE} from "../../config/config.js";

const DataSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId },
        categoryId: { type: mongoose.Schema.Types.ObjectId },
        brandId: { type: mongoose.Schema.Types.ObjectId },
        image: { type: String, default: ALL_DEFAULT_IMAGE},
        title: { type: String, required: true },
        subtitle: { type: String, required: true },
        isActive: { type: Boolean, default: false },
        remark: { type: String, required: true },
        badgeColor: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const MarketingCampaignModel = mongoose.model('marketingCampaign', DataSchema);

export default MarketingCampaignModel;