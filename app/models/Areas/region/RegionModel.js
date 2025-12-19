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

const RegionModel = mongoose.model('region', DataSchema);

export default RegionModel;