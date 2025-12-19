import {CreateReviewService} from "../../services/review/CreateReviewService.js";
import {ReviewListService} from "../../services/review/ReviewListService.js";
import {ReviewDeleteService} from "../../services/review/ReviewDeleteService.js";
import {clearCorruptedCache} from "../../utility/cache/cacheCleanup.js";

// Create
export const CreateReview = async (req, res) => {
    try {
        const result = await CreateReviewService(req);
        res.json(result);
    } catch (error) {
        console.error('Review controller error:', error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
}

// Review List
// Initialize cache cleanup on module load
(async () => {
    try {
        await clearCorruptedCache();
        console.log("✅ Review service cache initialized successfully");
    } catch (error) {
        console.log("❌ Review cache initialization failed:", error.message);
    }
})();

export const ReviewList = async (req, res) => {
    try {
        const result = await ReviewListService(req);

        // Set cache headers for CDN/browser caching
        res.set({
            'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
            'Vary': 'Accept-Encoding'
        });

        res.json(result);
    } catch (error) {
        console.error('Review controller error:', error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
}

// Review Delete
export const ReviewDelete = async (req, res) => {
    const result = await ReviewDeleteService(req, res);
    res.json(result);
}