import {WishListService} from "../../services/wish/WishListService.js";
import {SaveWishListService} from "../../services/wish/SaveWishListService.js";
import {RemoveWishListService} from "../../services/wish/RemoveWishListService.js";

// Wish List
export const WishList = async (req, res) => {
    const result = await WishListService(req, res);
    res.json(result);
}

// Save Wish List
    export const SaveWishList = async (req, res) => {
    const result = await SaveWishListService(req, res);
    res.json(result);
}

// Remove Wish List
export const RemoveWishList = async (req, res) => {
    const result = await RemoveWishListService(req, res);
    res.json(result);
} 