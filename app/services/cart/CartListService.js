// services/cartService.js
import { ObjectId } from "mongodb";
import CartModel from "../../models/cart/CartModel.js";
import { TokenDecode } from "../../utility/TokenUtility.js";
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 2 * 60; // 2 minutes (cart data changes frequently)
const CACHE_PREFIX = 'cart:';

export const CartListService = async (req) => {
    try {
        let matchStage = {};
        let userType = 'none';
        let cacheKey = '';

        // ✔ Logged-in user → token → decode → user_id
        if (req.headers['token']) {
            const decoded = TokenDecode(req.headers['token']);

            if (decoded && decoded.user_id) {
                let userId = new ObjectId(decoded.user_id);
                matchStage = { $match: { userId: userId } };
                userType = 'user';
                cacheKey = `${CACHE_PREFIX}user_${decoded.user_id}`;
            }
        }

        // ✔ Guest user → frontend sends guestid header
        else if (req.headers['guestid']) {
            matchStage = { $match: { guestId: req.headers['guestid'] } };
            userType = 'guest';
            cacheKey = `${CACHE_PREFIX}guest_${req.headers['guestid']}`;
        }

        // No user and no guest
        else {
            return { status: "success", message: "Request Successful!", total: 0, data: [] };
        }

        // 1️⃣ Try Redis cache first
        if (cacheKey) {
            const cachedData = await cacheHelper.get(cacheKey);
            if (cachedData) {
                console.log(`✅ Cache HIT for ${userType} cart: ${cacheKey}`);
                return {
                    status: "success",
                    message: "Request Successful! (Cached)",
                    total: cachedData.total,
                    data: cachedData.data,
                    cached: true
                };
            }
        }

        console.log(`🔍 Cache MISS for ${userType} cart: ${cacheKey}, querying database...`);

        // FIRST: Let's check what's in the cart without any joins
        let cartItems = await CartModel.find(matchStage.$match).lean();

        if (cartItems.length === 0) {
            // Cache empty cart result
            if (cacheKey) {
                await cacheHelper.set(cacheKey, { total: 0, data: [] }, CACHE_TTL);
            }
            return { status: "success", message: "Request Successful!", total: 0, data: [] };
        }

        // Lookup stages - FIXED with proper field mapping
        let JoinStageProduct = {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        };

        let unwindProductStage = {
            $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true
            }
        };

        let JoinStageBrand = {
            $lookup: {
                from: "brands",
                localField: "product.brandId",
                foreignField: "_id",
                as: "brand"
            }
        };

        let unwindBrandStage = {
            $unwind: {
                path: "$brand",
                preserveNullAndEmptyArrays: true
            }
        };

        let JoinStageCategory = {
            $lookup: {
                from: "categories",
                localField: "product.categoryId",
                foreignField: "_id",
                as: "category"
            }
        };

        let unwindCategoryStage = {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true
            }
        };

        let projectionStage = {
            $project: {
                _id: 1,
                productId: 1,
                userId: 1,
                guestId: 1,
                color: 1,
                qty: 1,
                size: 1,
                createdAt: 1,
                updatedAt: 1,
                image: 1,
                // Product fields
                'product.name': 1,
                'product.image': 1,
                'product.price': 1,
                'product.discount': 1,
                // Brand fields
                'brand.name': 1,
                // Category fields
                'category.name': 1,
            }
        };

        let data = await CartModel.aggregate([
            matchStage,
            JoinStageProduct,
            unwindProductStage,
            JoinStageBrand,
            unwindBrandStage,
            JoinStageCategory,
            unwindCategoryStage,
            projectionStage,
        ]);

        let totalCount = await CartModel.countDocuments(matchStage.$match);

        // 2️⃣ Cache the result asynchronously (non-blocking)
        if (cacheKey && data.length > 0) {
            cacheHelper.set(cacheKey, { total: totalCount, data: data }, CACHE_TTL)
                .then(() => console.log(`💾 Cached data for ${userType} cart: ${cacheKey}`))
                .catch(err => console.log('❌ Cache set failed:', err.message));
        }

        return {
            status: "success",
            message: "Request Successful!",
            total: totalCount,
            data: data,
            cached: false
        };

    } catch (e) {
        console.error("CartListService Error:", e);

        // 3️⃣ Graceful degradation: Try to return cached data on error
        try {
            let cacheKey = '';

            if (req.headers['token']) {
                const decoded = TokenDecode(req.headers['token']);
                if (decoded && decoded.user_id) {
                    cacheKey = `${CACHE_PREFIX}user_${decoded.user_id}`;
                }
            } else if (req.headers['guestid']) {
                cacheKey = `${CACHE_PREFIX}guest_${req.headers['guestid']}`;
            }

            if (cacheKey) {
                const staleData = await cacheHelper.get(cacheKey);
                if (staleData) {
                    console.log(`🔄 Using stale cache for cart due to error`);
                    return {
                        status: "success",
                        message: "Request Successful! (Stale Cache)",
                        total: staleData.total,
                        data: staleData.data,
                        cached: true,
                        error: "Using cached data due to temporary issue"
                    };
                }
            }
        } catch (cacheError) {
            // Continue to original error
        }

        return { status: "fail", message: "Something Went Wrong !" };
    }
}