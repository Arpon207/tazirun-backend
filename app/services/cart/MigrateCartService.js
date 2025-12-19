// services/cart/MigrateCartService.js
import { ObjectId } from "mongodb";
import CartModel from "../../models/cart/CartModel.js";

export const MigrateCartService = async (req) => {
    try {
        const userId = new ObjectId(req.headers['user_id']);
        const guestId = req.cookies.guestId;

        if (!guestId) {
            return { status: "success", message: "No guest cart to migrate" };
        }

        // Find all guest cart items
        const guestCartItems = await CartModel.find({ guestId });

        if (guestCartItems.length === 0) {
            return { status: "success", message: "No guest cart items to migrate" };
        }

        // Migrate each item
        for (const item of guestCartItems) {
            // Check if user already has this product in their cart
            const existingItem = await CartModel.findOne({
                userId,
                productId: item.productId,
                color: item.color || { $in: [null, ""] },
                size: item.size || { $in: [null, ""] }
            });

            if (existingItem) {
                // Update quantity if item exists
                await CartModel.findByIdAndUpdate(
                    existingItem._id,
                    { $inc: { qty: item.qty } }
                );
                // Remove the guest item
                await CartModel.deleteOne({ _id: item._id });
            } else {
                // Change guestId to userId using update operation
                await CartModel.findByIdAndUpdate(
                    item._id,
                    {
                        $set: { userId: userId },
                        $unset: { guestId: "" }
                    }
                );
            }
        }

        return { status: "success", message: "Cart migrated successfully" };
    } catch (e) {
        console.error("MigrateCartService Error:", e);
        return { status: "fail", message: "Failed to migrate cart" };
    }
};