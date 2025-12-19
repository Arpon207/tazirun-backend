import {ObjectId} from "mongodb";
import UsersModel from "../../models/users/UsersModel.js";

export const UserDetailsByIdService = async (req, res) => {
    try {
        const userId = new ObjectId(req.params['id']);

        const data = await UsersModel.aggregate([
            {$match: { _id: userId }},
            {$project: { role: 1, isBanned: 1 }}
        ]);

        return { status: "success", message: "Request successful!", data: data };
    } catch (e) {
        return { status: "error", message: e.toString() };
    }
};
