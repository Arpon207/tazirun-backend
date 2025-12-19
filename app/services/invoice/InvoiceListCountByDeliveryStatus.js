import { ObjectId } from "mongodb";
import InvoiceModel from "../../models/invoice/InvoiceModel.js";

export const InvoiceListCountByDeliveryStatusService = async (req, res) => {
    try {
        const userIdHeader = req.headers['user_id'];
        const role = req.headers['role'];

        let match = {};
        if (role !== "superadmin" && role !== "admin") {
            if (!userIdHeader) {
                return { status: "fail", message: "Missing user_id in headers" };
            }

            try {
                match.userId = new ObjectId(userIdHeader);
            } catch {
                return { status: "fail", message: "Invalid user_id format" };
            }
        }

        // Aggregate count by delivery_status
        const result = await InvoiceModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$delivery_status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    delivery_status: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        return {
            status: "success",
            message: "Request successful!",
            data: result
        };
    } catch (e) {
        console.error("Error:", e);
        return { status: "fail", message: e.toString() };
    }
};
