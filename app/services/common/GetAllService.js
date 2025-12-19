// services/brandService.js
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 15 * 60; // 15 minutes
const CACHE_PREFIX = 'all_brands:';

// Get All Service (Optimized Projection)
export const GetAllService = async (Request, DataModel) => {
    try {
        const cacheKey = `${CACHE_PREFIX}${DataModel.collection.collectionName}`;

        // 1️⃣ Try Redis cache first
        const cachedData = await cacheHelper.get(cacheKey);
        if (cachedData) {
            console.log(`✅ Cache HIT for all ${DataModel.collection.collectionName}`);
            return {
                status: "success",
                data: cachedData,
                cached: true,
                count: cachedData.length
            };
        }

        console.log(`🔍 Cache MISS for all ${DataModel.collection.collectionName}, querying database...`);

        // 2️⃣ Database query - ORIGINAL LOGIC UNCHANGED
        const data = await DataModel.aggregate([
            { $match: {} },

            // Only choose required fields = Faster Query, Smaller Response
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    image: 1,
                    createdAt: 1,
                }
            }
        ]);

        // 3️⃣ Cache the result asynchronously (non-blocking)
        if (data && data.length > 0) {
            cacheHelper.set(cacheKey, data, CACHE_TTL)
                .then(() => console.log(`💾 Cached ${data.length} ${DataModel.collection.collectionName}`))
                .catch(err => console.log('❌ Cache set failed:', err.message));
        }

        return {
            status: "success",
            data: data,
            cached: false,
            count: data ? data.length : 0
        };

    } catch (error) {
        console.error("GetAllService Error:", error);

        // 4️⃣ Graceful degradation: Try to return cached data on error
        try {
            const cacheKey = `${CACHE_PREFIX}${DataModel.collection.collectionName}`;
            const staleData = await cacheHelper.get(cacheKey);
            if (staleData) {
                console.log(`🔄 Using stale cache for ${DataModel.collection.collectionName} due to error`);
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

        return {
            status: "fail",
            message: "Something went wrong"
        };
    }
};