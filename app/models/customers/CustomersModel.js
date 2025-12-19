import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String, required: true },
        phone: { type: String, unique: true },
        email: { type: String },
        region: { type: String, required: true },
        thana: { type: String, required: true },
        district: { type: String, required: true },
        division: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const CustomerModel = mongoose.model('customer', DataSchema);

export default CustomerModel;