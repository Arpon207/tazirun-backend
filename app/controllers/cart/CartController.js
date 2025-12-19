import {CartListService} from "../../services/cart/CartListService.js";
import {SaveCartListService} from "../../services/cart/SaveCartListService.js";
import {UpdateCartListService} from "../../services/cart/UpdateCartList.js";
import {RemoveCartListService} from "../../services/cart/RemoveCartListService.js";
import {clearCorruptedCache} from "../../utility/cache/cacheCleanup.js";

// Cart List
// Initialize cache cleanup on module load
(async () => {
    try {
        await clearCorruptedCache();
        console.log("✅ Cart service cache initialized successfully");
    } catch (error) {
        console.log("❌ Cart cache initialization failed:", error.message);
    }
})();

// Cart List - CONTROLLER
export const CartList = async (req, res) => {
    const result = await CartListService(req, res);
    res.json(result);
}

// Save Cart List
// Initialize cache cleanup on module load
(async () => {
    try {
        await clearCorruptedCache();
        console.log("✅ Cart service cache initialized successfully");
    } catch (error) {
        console.log("❌ Cart cache initialization failed:", error.message);
    }
})();

// Save Cart List - CONTROLLER
export const SaveCartList = async (req, res) => {
    const result = await SaveCartListService(req);
    res.json(result);
}

// Update Cart List
// Initialize cache cleanup on module load
(async () => {
    try {
        await clearCorruptedCache();
        console.log("✅ Cart service cache initialized successfully");
    } catch (error) {
        console.log("❌ Cart cache initialization failed:", error.message);
    }
})();

// Update Cart List - CONTROLLER
export const UpdateCartList = async (req, res) => {
    const result = await UpdateCartListService(req, res);
    res.json(result);
}

// Delete Cart List
export const DeleteCartList = async (req, res) => {
    const result = await RemoveCartListService(req, res);
    res.json(result);
}