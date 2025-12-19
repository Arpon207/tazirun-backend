import mongoose from 'mongoose';
import {ALL_DEFAULT_IMAGE} from "../../config/config.js";

const DataSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId },
        title: { type: String, required: true },
        shortDes: { type: String, required: true },
        isActive: { type: Boolean, default: false },
        image: { type: String, default: ALL_DEFAULT_IMAGE},
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const SliderModel = mongoose.model('slider', DataSchema);

export default SliderModel;