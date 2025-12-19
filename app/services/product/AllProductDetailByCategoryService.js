// services/productService.js

import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 5 * 60; // 5 minutes
const CACHE_PREFIX = 'all_category:';

export const AllProductDetailByCategoryService = async (
    Request,
    DataModel,
    MatchQuery,
    SearchArray,
    JoinStage1,
    JoinStage2,
    UnwindBrandStage1,
    UnwindBrandStage2,
    Projection
) => {
    try {
        const pageNo = Number(Request.params.pageNo);
        const perPage = Number(Request.params.perPage);
        const searchValue = Request.params.searchKeyword;
        const categoryId = MatchQuery.subSubCategoryId.toString();

        // Create unique cache key based on all parameters
        const cacheKey = `${CACHE_PREFIX}${categoryId}_${searchValue}_${pageNo}_${perPage}`;

        // 1️⃣ Try cache first
        const cachedData = await cacheHelper.get(cacheKey);
        if (cachedData) {
            console.log(`✅ Cache HIT for category: ${categoryId}, page: ${pageNo}`);
            return {
                status: "success",
                message: "Request Successful! (Cached)",
                data: cachedData,
                cached: true
            };
        }

        console.log(`🔍 Cache MISS for category: ${categoryId}, page: ${pageNo}, querying database...`);

        let skipRow = (pageNo - 1) * perPage;
        let data;

        // 2️⃣ Database query - ORIGINAL LOGIC UNCHANGED
        if (searchValue !== "0") {
            let searchQuery = { $or: SearchArray };

            data = await DataModel.aggregate([
                { $match: { $and: [searchQuery, MatchQuery] } },
                JoinStage1,
                JoinStage2,
                UnwindBrandStage1,
                UnwindBrandStage2,
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }, Projection],
                    }
                },
            ]);

        } else {
            data = await DataModel.aggregate([
                { $match: MatchQuery },
                JoinStage1,
                JoinStage2,
                UnwindBrandStage1,
                UnwindBrandStage2,
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }, Projection],
                    }
                },
            ]);
        }

        // 3️⃣ Cache the result asynchronously (non-blocking)
        if (data && (data[0]?.Total?.length > 0 || data[0]?.Rows?.length > 0)) {
            cacheHelper.set(cacheKey, data, CACHE_TTL)
                .then(() => console.log(`💾 Cached data for category: ${categoryId}, page: ${pageNo}`))
                .catch(err => console.log('❌ Cache set failed:', err.message));
        }

        return {
            status: "success",
            message: "Request Successful!",
            data: data,
            cached: false
        };

    } catch (e) {
        console.error("AllProductDetailByCategoryService Error:", e);

        // 4️⃣ Graceful degradation: Try to return cached data on error
        try {
            const categoryId = MatchQuery.subSubCategoryId.toString();
            const searchValue = Request.params.searchKeyword;
            const pageNo = Number(Request.params.pageNo);
            const perPage = Number(Request.params.perPage);
            const cacheKey = `${CACHE_PREFIX}${categoryId}_${searchValue}_${pageNo}_${perPage}`;

            const staleData = await cacheHelper.get(cacheKey);
            if (staleData) {
                console.log(`🔄 Using stale cache for category: ${categoryId} due to error`);
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
};