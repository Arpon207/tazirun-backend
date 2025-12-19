import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
    {
        name: { type: String, unique : true },
        email: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ExpensesTypeModel = mongoose.model('expensetype', DataSchema);

export default ExpensesTypeModel;