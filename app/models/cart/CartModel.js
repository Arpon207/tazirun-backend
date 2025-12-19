import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId }, // Made optional for guest users
        guestId: { type: String }, // Added for guest users
        color: { type: String },
        qty: { type: Number, required: true },
        size: { type: String },
        name: { type: String },
        image: { type: String },
        price: { type: Number },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Add compound index for better query performance
DataSchema.index({ userId: 1, productId: 1 });
DataSchema.index({ guestId: 1, productId: 1 });

const CartModel = mongoose.model('cart', DataSchema);

export default CartModel;