import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
    {
        email: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId },
        typeID: { type: mongoose.Schema.Types.ObjectId },
        amount: { type: Number },
        note: { type: String }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ExpensesModel = mongoose.model('expense', DataSchema);

export default ExpensesModel;