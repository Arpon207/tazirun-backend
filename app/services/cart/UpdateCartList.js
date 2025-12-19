// services/cartService.js
import {ObjectId} from "mongodb";
import CartModel from "../../models/cart/CartModel.js";
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 2 * 60; // 2 minutes (cart data changes frequently)
const CACHE_PREFIX = 'cart:';

export const UpdateCartListService = async (req) => {
    try {

        let userId = new ObjectId(req.headers['user_id']);
        let id = new ObjectId(req.params['id']);
        let postBody = req.body;
        postBody.userId = userId;

        await CartModel.updateOne({ _id: id, userId: userId }, {$set: {postBody}});

        // 🔥 INVALIDATE CACHE - Cart data changed
        const cacheKey = `${CACHE_PREFIX}user_${userId.toString()}`;
        await cacheHelper.delete(cacheKey);
        console.log(`🗑️ Invalidated cache for user: ${userId.toString()}`);

        return {status:"success", message:"Cart updated successfully!"};

    }catch (e) {
        return {status:"fail",message:"Something Went Wrong !"}
    }
}