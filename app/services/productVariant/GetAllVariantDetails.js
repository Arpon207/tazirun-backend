import ProductsModel from "../../models/products/ProductsModel.js"; // Adjust import path
// DataModel is ProductVariantModel in your usage

export const GetAllVariantDetails = async (Request, DataModel, MatchQuery) => {
    try {
        const data = await DataModel.aggregate([
            { $match: MatchQuery },

            // Calculate total qty for each variant considering all scenarios
            {
                $addFields: {
                    variantQty: {
                        $sum: [
                            // Sum scenario1 sizes qty
                            {
                                $sum: {
                                    $map: {
                                        input: "$scenario1",
                                        as: "sc1",
                                        in: {
                                            $sum: {
                                                $map: {
                                                    input: "$$sc1.sizes",
                                                    as: "size",
                                                    in: { $toInt: "$$size.qty" }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            // Sum scenario2 qty (array of {color, qty})
                            {
                                $sum: {
                                    $map: {
                                        input: "$scenario2",
                                        as: "sc2",
                                        in: { $toInt: "$$sc2.qty" }
                                    }
                                }
                            },
                            // Sum scenario3 qty (array of {qty})
                            {
                                $sum: {
                                    $map: {
                                        input: "$scenario3",
                                        as: "sc3",
                                        in: { $toInt: "$$sc3.qty" }
                                    }
                                }
                            }
                        ]
                    }
                }
            },

            // Join with product info
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

            // Join category
            {
                $lookup: {
                    from: "categories",
                    localField: "product.categoryId",
                    foreignField: "_id",
                    as: "product.category"
                }
            },
            { $unwind: { path: "$product.category", preserveNullAndEmptyArrays: true } },

            // Join brand
            {
                $lookup: {
                    from: "brands",
                    localField: "product.brandId",
                    foreignField: "_id",
                    as: "product.brand"
                }
            },
            { $unwind: { path: "$product.brand", preserveNullAndEmptyArrays: true } },

            { $sort: { createdAt: -1 } }
        ]);

        // Aggregate total stock per productId across all variants
        const totalStockMap = data.reduce((acc, variant) => {
            const productIdStr = variant.productId.toString();
            acc[productIdStr] = (acc[productIdStr] || 0) + variant.variantQty;
            return acc;
        }, {});

        // Update products collection stock fields with new totals
        const updatePromises = Object.entries(totalStockMap).map(([productId, totalQty]) => {
            return ProductsModel.updateOne(
                { _id: productId },
                { $set: { stock: totalQty } }
            );
        });

        await Promise.all(updatePromises);

        // Update product.stock in aggregated data for consistency
        data.forEach(variant => {
            const pid = variant.productId.toString();
            if (variant.product) {
                variant.product.stock = totalStockMap[pid] || 0;
            }
        });

        return { status: "success", message: "Request Successful!", data };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
