// services/sliderService.js
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 5 * 60; // 5 minutes
const CACHE_PREFIX = 'all_sliders:';

export const GetAllSliderService = async (req, DataModel) => {
    const startTime = Date.now();

    try {
        const cacheKey = `${CACHE_PREFIX}active`;

        // 1️⃣ Try Redis cache first
        const cachedData = await cacheHelper.get(cacheKey);
        if (cachedData) {
            const cacheTime = Date.now() - startTime;
            return {
                status: "success",
                message: "Request Successful! (cached)",
                data: cachedData,
                meta: {
                    count: cachedData.length,
                    executionTime: `${cacheTime}ms`,
                    cached: true
                }
            };
        }

        console.log(`🔍 Cache MISS for all active sliders, querying database...`);

        // 2️⃣ Fetch from MongoDB - ORIGINAL LOGIC UNCHANGED
        const data = await DataModel.aggregate([
            { $match: { isActive: true } },
            { $project: { _id: 1, title: 1, image: 1, shortDes: 1, productId: 1 } },
            { $sort: { createdAt: -1 } }
        ]);

        const executionTime = Date.now() - startTime;

        // 3️⃣ Cache the result asynchronously (non-blocking)
        if (data && data.length > 0) {
            cacheHelper.set(cacheKey, data, CACHE_TTL)
                .then(() => console.log(`💾 Cached data for all active sliders`))
                .catch(err => console.log('❌ Cache set failed:', err.message));
        }

        return {
            status: "success",
            message: "Request Successful!",
            data,
            meta: {
                count: data.length,
                executionTime: `${executionTime}ms`,
                cached: false
            }
        };

    } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error('GetAllSliderService Error:', error.message);

        // 4️⃣ Return stale cache from Redis if DB fails
        try {
            const cacheKey = `${CACHE_PREFIX}active`;
            const staleData = await cacheHelper.get(cacheKey);
            if (staleData) {
                console.log(`🔄 Using stale cache for sliders due to error`);
                return {
                    status: "success",
                    message: "Request Successful! (stale cache)",
                    data: staleData,
                    meta: {
                        count: staleData.length,
                        executionTime: `${executionTime}ms`,
                        cached: true,
                        stale: true
                    }
                };
            }
        } catch (cacheError) {
            // Continue to original error
        }

        return {
            status: "error",
            message: "Service temporarily unavailable",
            data: null,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        };
    }
};