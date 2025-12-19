import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        review: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        images: {
            type: [String], // Array of image URLs
            default: []
        },
        helpfulCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Add indexes for better performance
ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ userId: 1 });

const ReviewModel = mongoose.model("Review", ReviewSchema);

export default ReviewModel;