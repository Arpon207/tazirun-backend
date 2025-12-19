// services/campaignService.js
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 10 * 60; // 10 minutes (campaigns change less frequently)
const CACHE_PREFIX = 'all_campaigns:';

export const AllCampaignService = async (Request, DataModel) => {
    try {
        const cacheKey = `${CACHE_PREFIX}active`;

        // 1️⃣ Try cache first
        const cachedData = await cacheHelper.get(cacheKey);
        if (cachedData) {
            console.log(`✅ Cache HIT for all active campaigns`);
            return {
                status: "success",
                message: "Request Successful! (Cached)",
                data: cachedData,
                cached: true
            };
        }

        console.log(`🔍 Cache MISS for all active campaigns, querying database...`);

        // 2️⃣ Database query - ORIGINAL LOGIC UNCHANGED
        const data = await DataModel.aggregate([
            { $match: { isActive: true } },
        ]);

        // 3️⃣ Cache the result asynchronously (non-blocking)
        if (data && data.length > 0) {
            cacheHelper.set(cacheKey, data, CACHE_TTL)
                .then(() => console.log(`💾 Cached data for all active campaigns`))
                .catch(err => console.log('❌ Cache set failed:', err.message));
        }

        return {
            status: "success",
            message: "Request Successful!",
            data: data,
            cached: false
        };

    } catch (e) {
        console.error("AllCampaignService Error:", e);

        // 4️⃣ Graceful degradation: Try to return cached data on error
        try {
            const cacheKey = `${CACHE_PREFIX}active`;
            const staleData = await cacheHelper.get(cacheKey);
            if (staleData) {
                console.log(`🔄 Using stale cache for campaigns due to error`);
                return {
                    status: "success",
                    message: "Request Successful! (Stale Cache)",
                    data: staleData,
                    cached: true,
                    error: "Using cached data due to temporary issue"
                };
            }
        } catch (cacheError) {
            // Continue to original error
        }

        return { status: "fail", data: e.toString() };
    }
}