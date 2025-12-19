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

const ThanaModel = mongoose.model('thana', DataSchema);

export default ThanaModel;