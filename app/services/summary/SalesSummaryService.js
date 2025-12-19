import SalesModel from "../../models/sales/SalesModel.js";

export const SalesSummaryService = async (Request) => {

    try{

        const email = Request.headers['email'];

        let data = await SalesModel.aggregate([
            { $match: { } },
            {
                $facet: {
                    Total: [{
                        $group: { _id: 0, TotalAmount: { $sum: "$grandTotal" } }
                    }],
                    Last30Days: [
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                TotalAmount: { $sum: "$grandTotal" }
                            }
                        },
                        {
                            $sort: { _id: -1 },
                        },
                        {
                            $limit: 30
                        }
                    ]
                }
            }
        ]);

        return { status: "success", data: data };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}