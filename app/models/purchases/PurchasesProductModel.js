import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        purchaseId: { type: mongoose.Schema.Types.ObjectId },
        productId: { type: mongoose.Schema.Types.ObjectId },
        email: { type: String },
        qty: { type: Number },
        unitCost: { type: Number },
        total: { type: Number },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const PurchasesProductModel = mongoose.model('purchaseproduct', DataSchema);

export default PurchasesProductModel;