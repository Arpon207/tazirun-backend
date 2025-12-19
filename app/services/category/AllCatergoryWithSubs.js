import NodeCache from "node-cache";

// Cache instance: 10 min TTL, check every 2 min
const categoryCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// ----------------------------
// Main Service Function
// ----------------------------
export const AllCategoryWithSubs = async (req, DataModel) => {
    try {
        const cacheKey = "ALL_CATEGORY_WITH_SUBS_TREE";

        // 1️⃣ Return from cache if available
        const cachedData = categoryCache.get(cacheKey);
        if (cachedData) {
            return {
                status: "success",
                message: "Request Successful! (from cache)",
                data: cachedData
            };
        }

        // 2️⃣ Aggregation pipeline optimized
        const data = await DataModel.aggregate([
            {
                $lookup: {
                    from: "subcategories",
                    localField: "_id",
                    foreignField: "categoryId",
                    as: "subcategories",
                    pipeline: [
                        {
                            $lookup: {
                                from: "subsubcategories",
                                localField: "_id",
                                foreignField: "subCategoryId",
                                as: "subsubcategories",
                                pipeline: [{ $project: { _id: 1, name: 1, subCategoryId: 1, image: 1 } }]
                            }
                        },
                        {
                            $lookup: {
                                from: "products",
                                let: { subCatId: "$_id" },
                                pipeline: [
                                    { $match: { $expr: { $eq: ["$subCategoryId", "$$subCatId"] } } },
                                    { $project: productProjection }
                                ],
                                as: "allProducts"
                            }
                        },
                        {
                            $addFields: {
                                products: { $filter: { input: "$allProducts", as: "p", cond: { $eq: ["$$p.subSubCategoryId", null] } } },
                                subsubcategories: {
                                    $map: {
                                        input: "$subsubcategories",
                                        as: "sub",
                                        in: {
                                            $mergeObjects: [
                                                "$$sub",
                                                { products: { $filter: { input: "$allProducts", as: "prod", cond: { $eq: ["$$prod.subSubCategoryId", "$$sub._id"] } } } }
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        { $project: subcategoryProjection }
                    ]
                }
            },
            {
                $lookup: {
                    from: "products",
                    let: { catId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $and: [{ $eq: ["$categoryId", "$$catId"] }, { $eq: ["$subCategoryId", null] }] }
                            }
                        },
                        { $project: productProjection }
                    ],
                    as: "products"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    products: 1,
                    subcategories: 1
                }
            }
        ]);

        // 3️⃣ Save to cache
        categoryCache.set(cacheKey, data);

        return { status: "success", message: "Request Successful!", data };
    } catch (error) {
        console.error("❌ AllCategoryWithSubs Error:", error);
        return { status: "fail", message: "Something went wrong!", error: error.message };
    }
};

// ----------------------------
// Product Projection
// ----------------------------
const productProjection = {
    _id: 1,
    name: 1,
    price: 1,
    discount: 1,
    discountPrice: 1,
    image: 1,
    image1: 1,
    image2: 1,
    image3: 1,
    image4: 1,
    image5: 1,
    stock: 1,
    size: 1,
    colorVariants: 1,
    details: 1,
    specification: 1,
    unit: 1,
    remark: 1,
    categoryId: 1,
    subCategoryId: 1,
    subSubCategoryId: 1
};

// ----------------------------
// Subcategory Projection
// ----------------------------
const subcategoryProjection = {
    _id: 1,
    name: 1,
    categoryId: 1,
    image: 1,
    products: 1,
    subsubcategories: {
        _id: 1,
        name: 1,
        subCategoryId: 1,
        image: 1,
        products: 1
    }
};

// ----------------------------
// Cache Invalidation (exported for update events)
// ----------------------------
export const clearCategoryCache = () => {
    categoryCache.del("ALL_CATEGORY_WITH_SUBS_TREE");
};
