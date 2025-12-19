import {ObjectId} from "mongodb";
import InvoiceModel from "../../models/invoice/InvoiceModel.js";

export const InvoiceListService = async (req, res) => {

    try{

        const user_id = new ObjectId(req.headers['user_id']);
        const role = req.headers['role'];
        const status = req.params['status'];

        const MatchQuery = { $match: { delivery_status: status } };
        const MatchingQueryWithId = {$match: {userId: user_id, delivery_status: status}};

        if ( role === "superadmin" || role === "admin" ){

            const invoice = await InvoiceModel.aggregate([
                MatchQuery,
            ]);

            return { status: "success", message: "Request Successful!", data: invoice };
        }else{

            const invoice = await InvoiceModel.aggregate([
                MatchingQueryWithId,
            ]);

            return { status: "success", message: "Request Successful!", data: invoice };

        }

    }catch (e) {
        return { status: "fail", message: e.toString() }
    }

}