import ReturnsProductModel from "../../models/returns/ReturunsProductModel.js";

export const ReturnReportService = async (Request) => {

    try{

        const email = Request.headers['email'];
        const formDate = Request.body['formDate'];
        const toDate = Request.body['toDate'];

        let data = await ReturnsProductModel.aggregate([
            { $match: { createdAt: {$gte: new Date(formDate), $lte: new Date(toDate) } } },
            {
                $facet: {
                    Total: [{
                        $group: { _id: 0, TotalAmount: { $sum: "$total" } }
                    }],
                    Rows: [
                        {$lookup: { from: "products", localField: "productId", foreignField: "_id", as: "products" }},
                        {$unwind: "$products"},
                        {$lookup: { from: "brands", localField: "products.brandId", foreignField: "_id", as: "brands" }},
                        {$lookup: { from: "categories", localField: "products.categoryId", foreignField: "_id", as: "categories" }},
                    ]
                }
            }
        ]);

        return { status: "success", message: "Expense report  successfully!", data: data };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}