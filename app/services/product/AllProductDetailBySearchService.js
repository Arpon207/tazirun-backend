import ProductsModel from "../../models/products/ProductsModel.js";
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 5 * 60; // 5 minutes
const CACHE_PREFIX = 'all_search:';

export const AllProductDetailBySearchService = async (Request) => {
    try {
        const searchKeyword = Request.params.keyword;
        const pageNo = Number(Request.params.pageNo);
        const perPage = Number(Request.params.perPage);

        // Create unique cache key based on all parameters
        const cacheKey = `${CACHE_PREFIX}${searchKeyword}_${pageNo}_${perPage}`;

        // 1️⃣ Try cache first
        const cachedData = await cacheHelper.get(cacheKey);
        if (cachedData) {
            console.log(`✅ Cache HIT for search: "${searchKeyword}", page: ${pageNo}`);
            return {
                status: "success",
                message: "Request Successful! (Cached)",
                data: cachedData,
                cached: true
            };
        }

        console.log(`🔍 Cache MISS for search: "${searchKeyword}", page: ${pageNo}, querying database...`);

        // Search regex
        const SearchRegx = { "$regex": searchKeyword, "$options": "i" };
        const numericSearchValue = isNaN(searchKeyword) ? 0 : Number(searchKeyword);

        // Join stages
        const JoinBrandStage = { $lookup: { from: "brands", localField: "brandId", foreignField: "_id", as: "brands" } };
        const JoinCategoryStage = { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categories" } };
        const JoinSubCategoryStage = { $lookup: { from: "subcategories", localField: "subCategoryId", foreignField: "_id", as: "subCategories" } };
        const JoinSubSubCategoryStage = { $lookup: { from: "subsubcategories", localField: "subSubCategoryId", foreignField: "_id", as: "subSubCategories" } };

        // Unwind stages
        const UnwindBrandStage = { $unwind: { path: "$brands", preserveNullAndEmptyArrays: true } };
        const UnwindCategoryStage = { $unwind: { path: "$categories", preserveNullAndEmptyArrays: true } };
        const UnwindSubCategoryStage = { $unwind: { path: "$subCategories", preserveNullAndEmptyArrays: true } };
        const UnwindSubSubCategoryStage = { $unwind: { path: "$subSubCategories", preserveNullAndEmptyArrays: true } };

        // Match stage after joins
        const MatchStage = {
            $match: {
                $or: [
                    { name: SearchRegx },
                    { details: SearchRegx },
                    { unit: SearchRegx },
                    { size: SearchRegx },
                    { remark: SearchRegx },
                    { specification: SearchRegx },
                    { price: numericSearchValue },
                    { "brands.name": SearchRegx },
                    { "categories.name": SearchRegx },
                    { "subCategories.name": SearchRegx },
                    { "subSubCategories.name": SearchRegx }
                ]
            }
        };

        // Projection
        const Projection = {
            $project: {
                name: 1,
                price: 1,
                discount: 1,
                discountPrice: 1,
                stock: 1,
                remark: 1,
                unit: 1,
                image: 1,
                "brands.name": 1,
                "categories.name": 1,
                "subCategories.name": 1,
                "subSubCategories.name": 1
            }
        };

        const skipRow = (pageNo - 1) * perPage;

        const data = await ProductsModel.aggregate([
            JoinBrandStage,
            JoinCategoryStage,
            JoinSubCategoryStage,
            JoinSubSubCategoryStage,
            UnwindBrandStage,
            UnwindCategoryStage,
            UnwindSubCategoryStage,
            UnwindSubSubCategoryStage,
            MatchStage,
            {
                $facet: {
                    Total: [{ $count: "count" }],
                    Rows: [
                        { $skip: skipRow },
                        { $limit: perPage },
                        Projection
                    ]
                }
            }
        ]);

        // 3️⃣ Cache the result asynchronously (non-blocking)
        if (data && (data[0]?.Total?.length > 0 || data[0]?.Rows?.length > 0)) {
            cacheHelper.set(cacheKey, data, CACHE_TTL)
                .then(() => console.log(`💾 Cached data for search: "${searchKeyword}", page: ${pageNo}`))
                .catch(err => console.log('❌ Cache set failed:', err.message));
        }

        return {
            status: "success",
            message: "Request Successful!",
            data: data,
            cached: false
        };

    } catch (error) {
        console.error("AllProductDetailBySearchService Error:", error);

        // 4️⃣ Graceful degradation: Try to return cached data on error
        try {
            const searchKeyword = Request.params.keyword;
            const pageNo = Number(Request.params.pageNo);
            const perPage = Number(Request.params.perPage);
            const cacheKey = `${CACHE_PREFIX}${searchKeyword}_${pageNo}_${perPage}`;

            const staleData = await cacheHelper.get(cacheKey);
            if (staleData) {
                console.log(`🔄 Using stale cache for search: "${searchKeyword}" due to error`);
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

        return { status: "fail", message: error.message };
    }
};