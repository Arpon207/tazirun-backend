// services/reviewService.js
import ReviewModel from "../../models/review/ReviewModel.js";
import mongoose from "mongoose";
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 10 * 60; // 10 minutes
const CACHE_PREFIX = 'reviews:';

export const ReviewListService = async (req) => {
    try {
        const productId = req.params.id;

        // 🔥 OPTIMIZATION: Validate productId early
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return {
                status: "fail",
                message: "Invalid product ID"
            };
        }

        const cacheKey = `${CACHE_PREFIX}${productId}`;

        // 🔥 OPTIMIZATION: Try cache first
        const cachedData = await cacheHelper.get(cacheKey);
        if (cachedData) {
            console.log(`✅ Cache HIT for product reviews: ${productId}`);
            return {
                status: "success",
                data: cachedData,
                cached: true,
                count: cachedData.length
            };
        }

        console.log(`🔍 Cache MISS for product reviews: ${productId}, querying database...`);

        // 🔥 OPTIMIZATION: Optimized aggregation pipeline
        const reviews = await ReviewModel.aggregate([
            {
                $match: {
                    productId: new mongoose.Types.ObjectId(productId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [ // 🔥 SUB-PIPELINE: Only fetch needed user fields
                        {
                            $project: {
                                _id: 1,
                                firstName: 1,
                                lastName: 1,
                                photo: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true // 🔥 Keep reviews even if user not found
                }
            },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    title: 1,
                    review: 1,
                    images: 1,
                    createdAt: 1,
                    "user._id": 1,
                    "user.firstName": 1,
                    "user.lastName": 1,
                    "user.photo": 1
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $limit: 100 // 🔥 LIMIT: Prevent excessive data retrieval
            }
        ]).maxTimeMS(10000); // 🔥 TIMEOUT: Prevent long-running queries

        // 🔥 OPTIMIZATION: Cache the result asynchronously
        if (reviews && reviews.length > 0) {
            cacheHelper.set(cacheKey, reviews, CACHE_TTL)
                .then(() => console.log(`💾 Cached ${reviews.length} reviews for product: ${productId}`))
                .catch(err => console.log('❌ Cache set failed:', err.message));
        }

        return {
            status: "success",
            data: reviews,
            cached: false,
            count: reviews.length
        };

    } catch (error) {
        console.error("ReviewListService Error:", error);

        // 🔥 OPTIMIZATION: Graceful degradation - try cache on error
        try {
            const productId = req.params.id;
            const cacheKey = `${CACHE_PREFIX}${productId}`;

            const staleData = await cacheHelper.get(cacheKey);
            if (staleData) {
                console.log(`🔄 Using stale cache for product reviews due to error: ${productId}`);
                return {
                    status: "success",
                    data: staleData,
                    cached: true,
                    stale: true,
                    count: staleData.length,
                    error: "Using cached data due to temporary issue"
                };
            }
        } catch (cacheError) {
            // Continue to original error
        }

        // 🔥 OPTIMIZATION: Better error messages
        let errorMessage = "Failed to fetch reviews";

        if (error.name === 'CastError') {
            errorMessage = "Invalid product ID format";
        } else if (error.name === 'MongoNetworkError') {
            errorMessage = "Database connection failed";
        } else if (error.message.includes('maxTimeMS')) {
            errorMessage = "Request timeout - too many reviews to process";
        }

        return {
            status: "error",
            message: process.env.NODE_ENV === 'development' ? error.message : errorMessage
        };
    }
};