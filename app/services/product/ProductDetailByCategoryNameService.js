// services/productCategoryService.js
import {clearCorruptedCache} from "../../utility/cache/cacheCleanup.js";
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 10 * 60; // 10 minutes in seconds
const CACHE_PREFIX = 'category:';

// Initialize Redis connection and cleanup on startup
(async () => {
    try {
        // Clear any corrupted cache data on startup
        await clearCorruptedCache();
        console.log("✅ Category service cache initialized successfully");
    } catch (error) {
        console.log("❌ Category service cache initialization failed:", error.message);
    }
})();

export const ProductDetailByCategoryNameService = async (Request, DataModel, MatchQuery) => {
    let cacheKey = null;

    try {
        // Create cache key
        cacheKey = `${CACHE_PREFIX}${MatchQuery.catName}`;

        // Try to get from Redis cache using cacheHelper
        const cachedData = await cacheHelper.get(cacheKey);
        if (cachedData) {
            console.log(`✅ Cache HIT for category: ${MatchQuery.catName}`);
            return {
                status: "success",
                message: "Request Successful!",
                data: cachedData,
                cached: true
            };
        }

        console.log(`🔍 Cache MISS for category: ${MatchQuery.catName}, querying database...`);

        // Original database query - EXACT SAME FUNCTIONALITY
        const data = await DataModel.aggregate([
            { $match: MatchQuery },
            { $sort: { _id: -1 } },
            { $limit: 12 }
        ]);

        // Cache the result if we got data using cacheHelper
        if (data && data.length > 0) {
            // Non-blocking cache set
            cacheHelper.set(cacheKey, data, CACHE_TTL)
                .then(() => console.log(`💾 Cached data for category: ${MatchQuery.catName}`))
                .catch(err => console.log('❌ Cache set failed:', err.message));
        }

        return {
            status: "success",
            message: "Request Successful!",
            data: data,
            cached: false
        };

    } catch (e) {
        console.error("ProductDetailByCategoryNameService Error:", e);

        // Try to return cached data even on error (graceful degradation)
        if (cacheKey) {
            try {
                const staleData = await cacheHelper.get(cacheKey);
                if (staleData) {
                    console.log(`🔄 Using stale cache for category: ${MatchQuery.catName} due to error`);
                    return {
                        status: "success",
                        message: "Request Successful!",
                        data: staleData,
                        cached: true,
                        error: "Using cached data due to temporary issue"
                    };
                }
            } catch (cacheError) {
                // Continue to original error response
            }
        }

        return {
            status: "fail",
            data: e.toString()
        };
    }
};