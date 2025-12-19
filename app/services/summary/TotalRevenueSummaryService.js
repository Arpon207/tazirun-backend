import ExpensesModel from "../../models/expenses/ExpensesModel.js";
import SalesModel from "../../models/sales/SalesModel.js";
import PurchaseModel from "../../models/purchases/PurchasesModel.js";
import ReturnsModel from "../../models/returns/ReturnsModel.js";

export const TotalRevenueSummaryService = async (Request) => {

    try{

        const email = Request.headers['email'];

        let ExpenseData = await ExpensesModel.aggregate([
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

        let SaleData = await SalesModel.aggregate([
            { $match: {  } },
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

        let PurchaseData = await PurchaseModel.aggregate([
            { $match: {  } },
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

        let ReturnData = await ReturnsModel.aggregate([
            { $match: {  } },
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

        return { status: "success", data: { SaleData, PurchaseData, ExpenseData, ReturnData } };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}