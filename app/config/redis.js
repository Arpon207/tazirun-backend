// app/config/redis.js
import { Redis } from "@upstash/redis";
import { REDIS_URL, REDIS_TOKEN } from "./config.js";

export const redis = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
    retry: {
        retries: 3,
        backoff: (retryCount) => Math.min(retryCount * 100, 3000),
    },
});

export const testRedisConnection = async () => {
    try {
        await redis.ping();
        console.log("✅ Redis connected successfully");
        return true;
    } catch (error) {
        console.log("❌ Redis connection failed:", error.message);
        return false;
    }
};
