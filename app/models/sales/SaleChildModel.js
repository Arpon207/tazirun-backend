import mongoose from "mongoose";

const SaleChildSchema = new mongoose.Schema({
    saleId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'sales' },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productName: { type: String, required: true },
    qty: { type: Number, required: true },
    total: { type: Number, required: true },
    email: { type: String }
}, {
    timestamps: true,
    versionKey: false,
});

const SaleChildModel = mongoose.model("salechilds", SaleChildSchema);
export default SaleChildModel;
