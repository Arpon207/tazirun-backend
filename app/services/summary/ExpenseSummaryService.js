import ExpensesModel from "../../models/expenses/ExpensesModel.js";

export const ExpenseSummaryService = async (Request) => {

    try{

        const email = Request.headers['email'];

        let data = await ExpensesModel.aggregate([
            { $match: {  } },
            {
                $facet: {
                    Total: [{
                        $group: { _id: 0, TotalAmount: { $sum: "$amount" } }
                    }],
                    Last30Days: [
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                TotalAmount: { $sum: "$amount" }
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