import mongoose from 'mongoose';
import {DEFAULT_IMAGE} from "../../config/config.js";

const DataSchema = new mongoose.Schema(
    {
        email: { type: String, unique: true, required: true, lowercase: true, trim: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        mobile: { type: String, required: true },
        password: { type: String, required: true },
        isBanned: { type: Boolean, default: false },
        role: { type: String, default: 'user' },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const UsersModel = mongoose.model('users', DataSchema);

export default UsersModel;