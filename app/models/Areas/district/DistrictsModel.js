import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const DistrictModel = mongoose.model('district', DataSchema);

export default DistrictModel;