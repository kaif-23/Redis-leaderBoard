import express from "express";
import redisClient from "../redis.js";

const router = express.Router();

router.post("/:id/view", async (req, res) => {
    try {
        const { id } = req.params;

        const views = await redisClient.incr(`post:${id}:views`);

        res.json({
            postId: id,
            views,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to increment views",
        });
    }
});

export default router;