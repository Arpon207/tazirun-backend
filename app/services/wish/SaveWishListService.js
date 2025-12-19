import {ObjectId} from "mongodb";
import WishModel from "../../models/wish/WishModel.js";

export const SaveWishListService = async (req) => {
    try {
        const userId = new ObjectId(req.headers['user_id']);
        const { productId } = req.body;

        const postBody = {
            productId: productId,
            userId: userId
        };

        await WishModel.create(postBody);

        return { status: "success", message: "Product added to wish list successfully!" };

    } catch (e) {
        console.error(e); // Helpful for debugging
        return { status: "fail", message: "Something went wrong!" };
    }
}
