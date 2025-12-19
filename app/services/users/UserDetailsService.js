// services/users/UserDetailsService.js (Cached Version)
import UsersModel from "../../models/users/UsersModel.js";
import { ObjectId } from "mongodb";
import {cacheHelper} from "../../utility/cache/cacheHelper.js";

const CACHE_TTL = 10 * 60; // 10 minutes
const CACHE_PREFIX = 'user:';

export const UserDetailsService = async (req, res) => {
    try {
        const userID = req.headers['user_id'];

        // Early validation
        if (!userID) {
            return { status: "fail", message: "User ID is required" };
        }

        if (!ObjectId.isValid(userID)) {
            return { status: "fail", message: "Invalid user ID format" };
        }

        const cacheKey = `${CACHE_PREFIX}${userID}`;

        // 🔥 OPTIMIZATION: Try cache first
        const cachedData = await cacheHelper.get(cacheKey);
        if (cachedData) {
            console.log(`✅ Cache HIT for user: ${userID}`);
            return {
                status: "success",
                message: "Request successful (Cached)",
                data: cachedData,
                cached: true
            };
        }

        console.log(`🔍 Cache MISS for user: ${userID}, querying database...`);

        const userObjectId = new ObjectId(userID);

        // Optimized database query
        const user = await UsersModel.findOne(
            { _id: userObjectId },
            {
                email: 1,
                firstName: 1,
                lastName: 1,
                mobile: 1,
            }
        ).lean();

        if (!user) {
            return { status: "fail", message: "User not found" };
        }

        // Remove _id from response
        const { _id, ...userData } = user;

        // 🔥 OPTIMIZATION: Cache the result asynchronously
        cacheHelper.set(cacheKey, userData, CACHE_TTL)
            .then(() => console.log(`💾 Cached user data: ${userID}`))
            .catch(err => console.log('❌ Cache set failed:', err.message));

        return {
            status: "success",
            message: "Request successful",
            data: userData,
            cached: false
        };

    } catch (e) {
        console.error("UserDetailsService Error:", e);

        // 🔥 OPTIMIZATION: Graceful degradation - try cache on error
        try {
            const userID = req.headers['user_id'];
            const cacheKey = `${CACHE_PREFIX}${userID}`;

            const staleData = await cacheHelper.get(cacheKey);
            if (staleData) {
                console.log(`🔄 Using stale cache for user due to error: ${userID}`);
                return {
                    status: "success",
                    message: "Request successful (Stale Cache)",
                    data: staleData,
                    cached: true,
                    stale: true,
                    error: "Using cached data due to temporary issue"
                };
            }
        } catch (cacheError) {
            // Continue to original error
        }

        let errorMessage = "Failed to fetch user details";
        if (e.name === 'CastError') errorMessage = "Invalid user ID format";
        else if (e.name === 'MongoNetworkError') errorMessage = "Database connection failed";

        return {
            status: "error",
            message: process.env.NODE_ENV === 'development' ? e.toString() : errorMessage
        };
    }
}