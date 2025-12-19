import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        supplierId: { type: mongoose.Schema.Types.ObjectId },
        productId: { type: mongoose.Schema.Types.ObjectId },
        email: { type: String },
        vatTax: { type: Number },
        discount: { type: Number },
        otherCost: { type: Number },
        shippingCost: { type: Number },
        grandTotal: { type: Number },
        note: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const PurchasesModel = mongoose.model('purchase', DataSchema);

export default PurchasesModel;