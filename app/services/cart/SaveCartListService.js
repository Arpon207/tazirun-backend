// services/cartService.js
import { ObjectId } from "mongodb";
import CartModel from "../../models/cart/CartModel.js";
import { v4 as uuidv4 } from 'uuid';
import { TokenDecode } from "../../utility/TokenUtility.js";
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 2 * 60; // 2 minutes (cart data changes frequently)
const CACHE_PREFIX = 'cart:';

export const SaveCartListService = async (req) => {
    try {
        let userId = null;
        let guestId = null;
        let postBody = req.body;

        // Validate product and quantity
        if (!postBody.productId) return { status: "fail", message: "Product ID is required" };
        if (!postBody.qty || postBody.qty < 1) return { status: "fail", message: "Valid quantity required" };

        console.log('check header token: ', req.headers['token']);

        // ✔ Check logged in user - FIXED: Extract user_id from token
        if (req.headers['token']) {
            try {
                const decoded = TokenDecode(req.headers['token']); // Decode the token
                console.log('Decoded token in SaveCart:', decoded);

                if (decoded && decoded.user_id) {
                    userId = new ObjectId(decoded.user_id); // Use user_id from token
                    console.log('Real user id from token:', userId.toString());
                    postBody.userId = userId;
                } else {
                    return { status: "fail", message: "Invalid token: user_id not found" };
                }
            } catch (e) {
                console.error("Token decode error:", e);
                return { status: "fail", message: "Invalid token format" };
            }
        }
        // ✔ Guest User Flow
        else {
            if (req.headers['guestid']) {
                guestId = req.headers['guestid']; // existing guest
            } else {
                guestId = uuidv4(); // create new guest id
            }
            postBody.guestId = guestId;
        }

        // Validate ObjectId
        let productId;
        try {
            productId = new ObjectId(postBody.productId);
        } catch (e) {
            return { status: "fail", message: "Invalid product ID format" };
        }

        // Build query
        const query = {
            productId: productId,
            $or: []
        };

        if (userId) query.$or.push({ userId: userId });
        else query.$or.push({ guestId: guestId });

        if (postBody.color) query.color = postBody.color;
        if (postBody.size) query.size = postBody.size;

        const existingCartItem = await CartModel.findOne(query);

        // ✔ Update Cart
        if (existingCartItem) {
            const updatedQty = existingCartItem.qty + parseInt(postBody.qty);
            await CartModel.updateOne(
                { _id: existingCartItem._id },
                { $set: { qty: updatedQty, updatedAt: new Date() } }
            );

            // 🔥 INVALIDATE CACHE - Cart data changed
            if (userId) {
                const cacheKey = `${CACHE_PREFIX}user_${userId.toString()}`;
                await cacheHelper.delete(cacheKey);
                console.log(`🗑️ Invalidated cache for user: ${userId.toString()}`);
            } else if (guestId) {
                const cacheKey = `${CACHE_PREFIX}guest_${guestId}`;
                await cacheHelper.delete(cacheKey);
                console.log(`🗑️ Invalidated cache for guest: ${guestId}`);
            }

            return {
                status: "success",
                message: "Cart updated successfully",
                guestId: guestId,
                cartItemId: existingCartItem._id
            };
        }

        // ✔ Create New Cart Item
        const newCartItem = {
            productId: productId,
            name: postBody.name,
            price: parseFloat(postBody.price),
            qty: parseInt(postBody.qty),
            image: postBody.image || null,
            color: postBody.color || null,
            size: postBody.size || null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (userId) newCartItem.userId = userId;
        else newCartItem.guestId = guestId;

        const createResult = await CartModel.create(newCartItem);

        console.log('✅ Cart item created with user ID:', userId ? userId.toString() : 'guest:' + guestId);

        // 🔥 INVALIDATE CACHE - Cart data changed
        if (userId) {
            const cacheKey = `${CACHE_PREFIX}user_${userId.toString()}`;
            await cacheHelper.delete(cacheKey);
            console.log(`🗑️ Invalidated cache for user: ${userId.toString()}`);
        } else if (guestId) {
            const cacheKey = `${CACHE_PREFIX}guest_${guestId}`;
            await cacheHelper.delete(cacheKey);
            console.log(`🗑️ Invalidated cache for guest: ${guestId}`);
        }

        return {
            status: "success",
            message: "Product added to cart!",
            guestId: guestId,
            cartItemId: createResult._id
        };

    } catch (error) {
        console.error("SaveCartListService Error:", error);
        return {
            status: "fail",
            message: "Server error: " + error.message
        };
    }
};