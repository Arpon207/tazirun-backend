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

const DivisionModel = mongoose.model('division', DataSchema);

export default DivisionModel;