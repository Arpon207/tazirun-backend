

// Initialize cache cleanup on module load
import {clearCorruptedCache} from "../../utility/cache/cacheCleanup.js";
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

(async () => {
    try {
        await clearCorruptedCache();
        console.log("✅ Product detail service cache initialized successfully");
    } catch (error) {
        console.log("❌ Product detail service cache initialization failed:", error.message);
    }
})();

export const ProductDetailByIdService = async (
    Request,
    DataModel,
    MatchQuery,
    JoinStage1,
    JoinStage2,
    UnwindBrandStage1,
    UnwindBrandStage2,
    Projection
) => {
    try {
        const productId = MatchQuery._id.toString();
        const cacheKey = `product:${productId}`;

        // 1️⃣ Try Redis Cache First using cacheHelper
        const cachedData = await cacheHelper.get(cacheKey);
        if (cachedData) {
            return {
                status: "success",
                message: "Request Successful! (Cached)",
                data: cachedData
            };
        }

        // 2️⃣ Run the ORIGINAL aggregation pipeline (unchanged)
        const data = await DataModel.aggregate([
            { $match: MatchQuery },
            JoinStage1,
            JoinStage2,
            UnwindBrandStage1,
            UnwindBrandStage2,
            Projection
        ]);

        // 3️⃣ Store in Redis (only if item exists) using cacheHelper
        if (data?.length > 0) {
            await cacheHelper.set(cacheKey, data, 300); // 5 minutes cache
        }

        return {
            status: "success",
            message: "Request Successful!",
            data: data
        };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};