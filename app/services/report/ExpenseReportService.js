import ExpensesModel from "../../models/expenses/ExpensesModel.js";

export const ExpenseReportService = async (Request) => {

    try{

        const email = Request.headers['email'];
        const formDate = Request.body['formDate'];
        const toDate = Request.body['toDate'];

        let data = await ExpensesModel.aggregate([
            { $match: { createdAt: {$gte: new Date(formDate), $lte: new Date(toDate) } } },
            {
                $facet: {
                    Total: [{
                        $group: { _id: 0, TotalAmount: { $sum: "$amount" } }
                    }],
                    Rows: [{
                        $lookup: { from: "expensetypes", localField: "typeID", foreignField: "_id", as: "type" },
                    }]
                }
            }
        ]);

        return { status: "success", message: "Expense report successful!", data: data };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}