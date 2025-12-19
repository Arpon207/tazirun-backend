import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        address: { type: String },
        phone: { type: String, unique: true },
        image: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId },
        email: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const SupplierModel = mongoose.model('supplier', DataSchema);

export default SupplierModel;