// utils/cacheHelper.js
import {redis} from "../../config/redis.js";

export const cacheHelper = {
    async get(key) {
        try {
            const cached = await redis.get(key);

            if (!cached) return null;

            // 🚨 Detect and handle corrupted data
            if (cached === '[object Object]' || cached.includes('[object Object]')) {
                console.log(`🗑️ Removing corrupted cache for: ${key}`);
                await this.delete(key);
                return null;
            }

            // Handle proper JSON parsing
            if (typeof cached === 'string') {
                try {
                    return JSON.parse(cached);
                } catch (parseError) {
                    console.log(`🗑️ Removing invalid JSON for: ${key}`);
                    await this.delete(key);
                    return null;
                }
            }

            return cached;

        } catch (error) {
            console.log(`❌ Cache read failed for ${key}:`, error.message);
            return null;
        }
    },

    async set(key, data, ttl = 300) {
        try {
            // ✅ Always stringify objects/arrays
            const value = typeof data === 'object' ? JSON.stringify(data) : data;
            await redis.set(key, value, { ex: ttl });
            console.log(`💾 Cached data for: ${key}`);
        } catch (error) {
            console.log(`❌ Cache write failed for ${key}:`, error.message);
        }
    },

    async delete(key) {
        try {
            await redis.del(key);
        } catch (error) {
            console.log(`❌ Cache delete failed for ${key}:`, error.message);
        }
    }
};