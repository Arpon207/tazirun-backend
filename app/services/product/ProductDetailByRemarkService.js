// ProductDetailByRemarkService.js
import DataModel from "../../models/products/ProductsModel.js";
import {clearCorruptedCache} from "../../utility/cache/cacheCleanup.js";
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 10 * 60; // 10 minutes
const CACHE_PREFIX = "remark:";

// Initialize cache cleanup on module load
(async () => {
    try {
        await clearCorruptedCache();
        console.log("✅ Product remark service cache initialized successfully");
    } catch (error) {
        console.log("❌ Product remark service cache initialization failed:", error.message);
    }
})();

// ---------------------------
// Controller Function
// ---------------------------
export const ProductDetailByRemark = async (req, res) => {
    const remark = req.params["remark"];
    const MatchQuery = { remark };

    // Aggregation stages
    const JoinStage1 = { $lookup: { from: "brands", localField: "brandId", foreignField: "_id", as: "brands" } };
    const JoinStage2 = { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categories" } };

    const UnwindBrandStage1 = { $unwind: "$brands" };
    const UnwindBrandStage2 = { $unwind: "$categories" };

    try {
        const result = await ProductDetailByRemarkService(
            DataModel,
            MatchQuery,
            JoinStage1,
            JoinStage2,
            UnwindBrandStage1,
            UnwindBrandStage2
        );
        res.json(result);
    } catch (err) {
        console.error("ProductDetailByRemark Controller Error:", err);
        res.status(500).json({ status: "fail", data: err.toString() });
    }
};

// ---------------------------
// Service Function
// ---------------------------
export const ProductDetailByRemarkService = async (
    DataModel,
    MatchQuery,
    JoinStage1,
    JoinStage2,
    UnwindBrandStage1,
    UnwindBrandStage2
) => {
    const cacheKey = `${CACHE_PREFIX}${MatchQuery.remark}`;

    try {
        // 1️⃣ Try Redis cache first using cacheHelper
        const cachedData = await cacheHelper.get(cacheKey);
        if (cachedData) {
            return {
                status: "success",
                message: "Request Successful! (Cached)",
                data: cachedData,
                cached: true,
            };
        }

        // 2️⃣ Fetch from DB
        const data = await DataModel.aggregate(
            [
                JoinStage1,
                JoinStage2,
                UnwindBrandStage1,
                UnwindBrandStage2,
                { $match: MatchQuery },
                { $sort: { _id: -1 } },
                { $limit: 12 },
            ],
            { maxTimeMS: 10000, allowDiskUse: false }
        );

        // 3️⃣ Cache the result asynchronously using cacheHelper
        if (data?.length > 0) {
            cacheHelper.set(cacheKey, data, CACHE_TTL)
                .catch((err) => console.error("Redis cache set error:", err.message));
        }

        return {
            status: "success",
            message: "Request Successful!",
            data,
            cached: false,
        };
    } catch (err) {
        console.error("ProductDetailByRemarkService Error:", err.message);

        // 4️⃣ Graceful fallback to cache if DB fails
        try {
            const staleData = await cacheHelper.get(cacheKey);
            if (staleData) {
                return {
                    status: "success",
                    message: "Request Successful! (Stale Cache)",
                    data: staleData,
                    cached: true,
                    error: "Using cached data due to temporary DB issue",
                };
            }
        } catch (_) {}

        return { status: "fail", data: err.toString() };
    }
};