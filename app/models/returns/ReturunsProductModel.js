import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        returnId: { type: mongoose.Schema.Types.ObjectId },
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

const ReturnsProductModel = mongoose.model('returnproduct', DataSchema);

export default ReturnsProductModel;