import {ObjectId} from "mongodb";
import WishModel from "../../models/wish/WishModel.js";

export const RemoveWishListService = async (req) => {
    try {

        let userId = new ObjectId(req.headers['user_id']);
        let id = new ObjectId(req.params['id']);

        await WishModel.deleteOne({_id: id, userId: userId});

        return {status:"success", message:"Wish item removed successfully!"};

    }catch (e) {
        return {status:"fail",message:"Something Went Wrong !"}
    }
}