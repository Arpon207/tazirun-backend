// services/reviewService.js
import ReviewModel from "../../models/review/ReviewModel.js";
import { ObjectId } from "mongodb";
import cloudinary from "../../config/cloudinary.js";

export const CreateReviewService = async (req) => {
    try {
        const { rating, title, review } = req.body;
        const role = req.headers['role'];
        const userId = new ObjectId(req.headers['user_id']);
        const productId = new ObjectId(req.params['id']);

        // 🔥 OPTIMIZATION: Early authorization check
        if (!['superadmin', 'admin', 'user'].includes(role)) {
            return { status: "fail", message: "You are not authorized!" };
        }

        // 🔥 OPTIMIZATION: Early validation with specific error messages
        const missingFields = [];
        if (!productId) missingFields.push('product ID');
        if (!rating) missingFields.push('rating');
        if (!title) missingFields.push('title');
        if (!review) missingFields.push('review');

        if (missingFields.length > 0) {
            return {
                status: "fail",
                message: `Missing required fields: ${missingFields.join(', ')}`
            };
        }

        // 🔥 OPTIMIZATION: Validate rating range early
        const ratingNum = parseInt(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return {
                status: "fail",
                message: "Rating must be a number between 1 and 5"
            };
        }

        // 🔥 OPTIMIZATION: Check for existing review with lean query
        const existingReview = await ReviewModel.findOne({
            productId,
            userId
        }, { _id: 1 }).lean(); // Only fetch _id for existence check

        if (existingReview) {
            return {
                status: "fail",
                message: "You have already reviewed this product"
            };
        }

        let imageUrls = [];

        // 🔥 OPTIMIZATION: Handle image uploads in parallel with error handling
        if (req.files && req.files.length > 0) {
            try {
                // Limit number of images to prevent abuse
                const filesToProcess = req.files.slice(0, 5); // Max 5 images

                const uploadPromises = filesToProcess.map(file =>
                    cloudinary.uploader.upload(file.path, {
                        folder: 'Tajir/reviews',
                        resource_type: 'auto',
                        quality: 'auto',
                        fetch_format: 'auto'
                    }).catch(error => {
                        console.error(`Failed to upload image: ${file.originalname}`, error);
                        return null; // Continue with other uploads if one fails
                    })
                );

                const results = await Promise.all(uploadPromises);

                // Filter out failed uploads and extract URLs
                imageUrls = results
                    .filter(result => result !== null && result.secure_url)
                    .map(result => result.secure_url);

                console.log(`Successfully uploaded ${imageUrls.length} images`);

            } catch (uploadError) {
                console.error('Image upload failed:', uploadError);
                // Continue without images rather than failing the entire review
            }
        }

        // 🔥 OPTIMIZATION: Create review with optimized data
        const newReview = await ReviewModel.create({
            productId,
            userId,
            rating: ratingNum, // Use validated number
            title: title.trim(), // Clean up whitespace
            review: review.trim(),
            images: imageUrls,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // 🔥 OPTIMIZATION: Return lean response without full document if not needed
        const responseData = {
            _id: newReview._id,
            productId: newReview.productId,
            rating: newReview.rating,
            title: newReview.title,
            images: newReview.images,
            createdAt: newReview.createdAt
        };

        return {
            status: "success",
            message: "Review created successfully!",
            data: responseData
        };

    } catch (error) {
        console.error("CreateReviewService Error:", error);

        // 🔥 OPTIMIZATION: More specific error messages
        let errorMessage = "Failed to create review";

        if (error.name === 'ValidationError') {
            errorMessage = "Invalid review data provided";
        } else if (error.name === 'MongoError' && error.code === 11000) {
            errorMessage = "Duplicate review detected";
        } else if (error.name === 'CastError') {
            errorMessage = "Invalid product or user ID format";
        }

        return {
            status: "error",
            message: process.env.NODE_ENV === 'development' ? error.message : errorMessage
        };
    }
};