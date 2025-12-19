// services/sales/SalesListService.js
import { ObjectId } from "mongodb";

export const SalesListService = async (req, SalesModel) => {
    try {
        const pageNo = parseInt(req.params.pageNo);
        const perPage = parseInt(req.params.perPage);
        const searchKeyword = req.params.searchKeyword;
        const skipRow = (pageNo - 1) * perPage;

        const SearchRegx = { "$regex": searchKeyword, "$options": "i" };
        const SearchArray = [
            { note: SearchRegx },
            { "customerId.name": SearchRegx },
            { "customerId.email": SearchRegx },
            { "productId.name": SearchRegx }
        ];

        let matchStage = {};
        if (searchKeyword !== "0") {
            matchStage = { $match: { $or: SearchArray } };
        }

        const result = await SalesModel.aggregate([
            {
                $lookup: {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customerId"
                }
            },
            { $unwind: "$customerId" },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productId"
                }
            },
            { $unwind: "$productId" },
            matchStage,
            {
                $facet: {
                    Total: [{ $count: "count" }],
                    Rows: [
                        { $skip: skipRow },
                        { $limit: perPage }
                    ]
                }
            }
        ]);

        const total = result[0]?.Total[0]?.count || 0;
        const rows = result[0]?.Rows || [];

        return { status: "success", total, data: rows };
    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
