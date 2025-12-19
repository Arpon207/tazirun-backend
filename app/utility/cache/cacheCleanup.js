// utils/cacheCleanup.js
import {redis} from "../../config/redis.js";

export const clearCorruptedCache = async () => {
    try {
        // Get all cache keys
        const keys = await redis.keys('*');
        let clearedCount = 0;

        for (const key of keys) {
            const value = await redis.get(key);
            // Check if value is corrupted [object Object]
            if (value && value.includes('[object Object]')) {
                await redis.del(key);
                clearedCount++;
                console.log(`🧹 Cleared corrupted key: ${key}`);
            }
        }

        console.log(`✅ Cleared ${clearedCount} corrupted cache entries`);
        return clearedCount;
    } catch (error) {
        console.log('❌ Error clearing corrupted cache:', error.message);
    }
};

// Run this once
// clearCorruptedCache();