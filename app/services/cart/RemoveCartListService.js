import {ObjectId} from "mongodb";
import CartModel from "../../models/cart/CartModel.js";
import { TokenDecode } from "../../utility/TokenUtility.js"; // Import your existing token utility

export const RemoveCartListService = async (req) => {
    try {
        let id = req.params.id;
        let query = {_id: new ObjectId(id)};

        // Extract user ID from token header
        let userId = null;
        let guestId = null;

        // Check for authenticated user (token contains user info)
        if (req.headers['token']) {
            try {
                // Use your existing TokenDecode function instead of the mock one
                const decodedToken = await TokenDecode(req.headers['token']);
                console.log("Decoded token for cart deletion:", decodedToken); // Debug log

                if (decodedToken && decodedToken.user_id) {
                    userId = new ObjectId(decodedToken.user_id);
                }
            } catch (tokenError) {
                console.error("Token decoding error:", tokenError);
            }
        }

        // Check for guest user
        if (req.headers['guestid']) {
            guestId = req.headers['guestid'];
        }

        // Build query based on user type
        if (userId) {
            // Authenticated user
            query.userId = userId;
            console.log("Deleting cart item for authenticated user:", userId.toString());
        } else if (guestId) {
            // Guest user
            query.guestId = guestId;
            console.log("Deleting cart item for guest user:", guestId);
        } else {
            console.log("No user identification found. Headers:", req.headers);
            return {status: "fail", message: "User identification required"};
        }

        console.log("Delete cart query:", query); // Debug log

        const result = await CartModel.deleteOne(query);

        if (result.deletedCount === 0) {
            console.log("No cart item found with query:", query);
            return {status: "fail", message: "Cart item not found or you don't have permission to delete it"};
        }

        console.log("Cart item deleted successfully. Deleted count:", result.deletedCount);
        return {status: "success", message: "Cart item removed successfully"};

    } catch (e) {
        console.error("RemoveCartListService Error:", e);
        return {status: "fail", message: "Something Went Wrong !"}
    }
}

// Remove the mock decodeToken function - use your existing TokenDecode from TokenUtility.js