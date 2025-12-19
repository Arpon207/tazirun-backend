import mongoose from 'mongoose';

const DataSchema =  new mongoose.Schema(
    {
        email: { type: String, unique: true, required: true, lowercase: true, trim: true },
        otp: { type: String, required: true },
        status: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const OtpModel = mongoose.model('otp', DataSchema);

export default OtpModel;