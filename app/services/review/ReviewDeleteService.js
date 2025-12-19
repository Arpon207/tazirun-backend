import { ObjectId } from "mongodb";
import ReviewModel from "../../models/review/ReviewModel.js";
import cloudinary from "../../config/cloudinary.js";

export const ReviewDeleteService = async (req, res) => {
    try {
        const id = new ObjectId(req.params['id']);

        // Step 1: Find the review by ID
        const review = await ReviewModel.findOne({ _id: id });

        if (!review) {
            return { status: "fail", message: "Review not found" };
        }

        // Step 2: Get image URL
        const imageUrl = review.image;
        if (imageUrl) {
            const parts = imageUrl.split('/');
            const publicIdWithExtension = parts[parts.length - 1]; // e.g., abc123.jpg
            const publicId = `Tajir/reviews/${publicIdWithExtension.split('.')[0]}`; // Adjust folder name as per your Cloudinary setup

            // Step 3: Delete from Cloudinary
            await cloudinary.uploader.destroy(publicId);
        }

        // Step 4: Delete the review from DB
        await ReviewModel.deleteOne({ _id: id });

        return { status: "success", message: "Review Deleted Successfully!" };

    } catch (e) {
        return { status: "error", message: e.toString() };
    }
};
