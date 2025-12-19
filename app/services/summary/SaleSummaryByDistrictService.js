import SalesModel from "../../models/sales/SalesModel.js";

export const SalesSummaryByDistrictService = async (Request) => {
    try {
        const district = Request.params['district'].trim(); // Remove extra spaces

        let data = await SalesModel.aggregate([
            // Join SalesModel with CustomerModel to get customer details
            {
                $lookup: {
                    from: "customers", // Collection name (MongoDB auto-pluralizes models)
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            { $unwind: "$customer" }, // Unwind to get individual customer objects
            {
                $match: {
                    "customer.district": { $regex: `^${district}$`, $options: "i" } // Case-insensitive match
                }
            },
            {
                $group: {
                    _id: 0,
                    TotalAmount: { $sum: "$grandTotal" } // Sum grandTotal for the district
                }
            }
        ]);

        return { status: "success", data: data.length > 0 ? data[0] : { TotalAmount: 0 } };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
