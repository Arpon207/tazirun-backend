import mongoose from 'mongoose';
import {ALL_DEFAULT_IMAGE} from "../../config/config.js";

const sizeQtySchema = new mongoose.Schema({
    size: { type: String, required: true },
    qty: { type: Number, required: true },
}, );

const DataSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, default: null },
        scenario1:[
            {

                color: { type: String, required: true },
                sizes: [sizeQtySchema],
            }
        ],
        scenario2:[
            {

                color: { type: String, required: true },
                qty: { type: Number, required: true },
            }
        ],
        scenario3:[
            {
                qty: { type: Number, required: true },
            }
        ],
        image: { type: String, default: ALL_DEFAULT_IMAGE},
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ProductVariantModel = mongoose.model('productVariants', DataSchema);

export default ProductVariantModel;