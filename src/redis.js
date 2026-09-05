import "dotenv/config";
import { createClient } from "redis";

console.log("Redis URL:", process.env.REDIS_URL);

const redisClient = createClient({
    url: process.env.REDIS_URL,
    RESP: 2
});

redisClient.on("error", (err) => {
    console.log("Redis Error:", err);
});

export async function connectRedis() {
    await redisClient.connect();
    console.log("Connected to Redis");
}
export default redisClient;