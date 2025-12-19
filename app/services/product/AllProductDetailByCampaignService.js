// services/campaignService.js
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 5 * 60; // 5 minutes
const CACHE_PREFIX = 'all_campaign:';

export const AllProductDetailByCampaignService = async (
    Request,
    DataModel,
    MatchQuery,
    SearchArray,
    JoinStage1,
    JoinStage2,
    UnwindBrandStage,
    UnwindCategoryStage,
    Projection
) => {
    try {
        const pageNo = Number(Request.params.pageNo);
        const perPage = Number(Request.params.perPage);
        const searchValue = Request.params.searchKeyword;
        const campaignId = MatchQuery.campaignId.toString();

        // Create unique cache key based on all parameters
        const cacheKey = `${CACHE_PREFIX}${campaignId}_${searchValue}_${pageNo}_${perPage}`;

        // 1️⃣ Try cache first
        const cachedData = await cacheHelper.get(cacheKey);
        if (cachedData) {
            console.log(`✅ Cache HIT for campaign: ${campaignId}, page: ${pageNo}`);
            return {
                status: "success",
                data: cachedData,
                message: "Products fetched successfully (Cached)",
                cached: true
            };
        }

        console.log(`🔍 Cache MISS for campaign: ${campaignId}, page: ${pageNo}, querying database...`);

        let skipRow = (pageNo - 1) * perPage;
        let data;

        if (searchValue !== "0") {
            let searchQuery = { $or: SearchArray };
            data = await DataModel.aggregate([
                { $match: MatchQuery },
                { $match: searchQuery },
                JoinStage1,
                JoinStage2,
                UnwindBrandStage,
                UnwindCategoryStage,
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }, Projection],
                    }
                }
            ]);
        } else {
            data = await DataModel.aggregate([
                { $match: MatchQuery },
                JoinStage1,
                JoinStage2,
                UnwindBrandStage,
                UnwindCategoryStage,
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }, Projection],
                    }
                }
            ]);
        }

        // 3️⃣ Cache the result asynchronously (non-blocking)
        if (data && (data[0]?.Total?.length > 0 || data[0]?.Rows?.length > 0)) {
            cacheHelper.set(cacheKey, data, CACHE_TTL)
                .then(() => console.log(`💾 Cached data for campaign: ${campaignId}, page: ${pageNo}`))
                .catch(err => console.log('❌ Cache set failed:', err.message));
        }

        return {
            status: "success",
            data: data,
            message: "Products fetched successfully",
            cached: false
        };

    } catch (e) {
        console.error("AllProductDetailByCampaignService Error:", e);

        // 4️⃣ Graceful degradation: Try to return cached data on error
        try {
            const campaignId = MatchQuery.campaignId.toString();
            const searchValue = Request.params.searchKeyword;
            const pageNo = Number(Request.params.pageNo);
            const perPage = Number(Request.params.perPage);
            const cacheKey = `${CACHE_PREFIX}${campaignId}_${searchValue}_${pageNo}_${perPage}`;

            const staleData = await cacheHelper.get(cacheKey);
            if (staleData) {
                console.log(`🔄 Using stale cache for campaign: ${campaignId} due to error`);
                return {
                    status: "success",
                    data: staleData,
                    message: "Products fetched successfully (Stale Cache)",
                    cached: true,
                    error: "Using cached data due to temporary issue"
                };
            }
        } catch (cacheError) {
            // Continue to original error
        }

        return {
            status: "fail",
            message: e.toString()
        };
    }
}