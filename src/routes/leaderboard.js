import express from "express";
import redisClient from "../redis.js";

const router = express.Router();


// ========================================
// POST /leaderboard/score
// Set player's score using ZADD
// ========================================
router.post("/score", async (req, res) => {
    try {
        const { playerId, score } = req.body;

        if (!playerId || score === undefined) {
            return res.status(400).json({
                message: "playerId and score are required",
            });
        }

        await redisClient.zAdd("leaderboard", {
            score: Number(score),
            value: playerId,
        });

        res.json({
            message: "Score updated successfully",
            playerId,
            score: Number(score),
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update score",
        });
    }
});


// ========================================
// POST /leaderboard/increment
// Add points using ZINCRBY
// ========================================
router.post("/increment", async (req, res) => {
    try {
        const { playerId, points } = req.body;

        if (!playerId || points === undefined) {
            return res.status(400).json({
                message: "playerId and points are required",
            });
        }

        const score = await redisClient.zIncrBy(
            "leaderboard",
            Number(points),
            playerId
        );

        res.json({
            playerId,
            score,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to increment score",
        });
    }
});


// ========================================
// GET /leaderboard/top
// Get top 10 using ZREVRANGE
// ========================================
router.get("/top", async (req, res) => {
    try {
        const players = await redisClient.zRangeWithScores(
            "leaderboard",
            0,
            9,
            {
                REV: true,
            }
        );

        const leaderboard = players.map((player, index) => ({
            rank: index + 1,
            playerId: player.value,
            score: player.score,
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch leaderboard",
        });
    }
});


// ========================================
// GET /leaderboard
// Get full leaderboard
// ========================================
router.get("/", async (req, res) => {
    try {
        const players = await redisClient.zRangeWithScores(
            "leaderboard",
            0,
            -1,
            {
                REV: true,
            }
        );

        const leaderboard = players.map((player, index) => ({
            rank: index + 1,
            playerId: player.value,
            score: player.score,
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch leaderboard",
        });
    }
});


// ========================================
// GET /leaderboard/:playerId/rank
// Get player's rank using ZREVRANK
// ========================================
router.get("/:playerId/rank", async (req, res) => {
    try {
        const { playerId } = req.params;

        const rank = await redisClient.zRevRank(
            "leaderboard",
            playerId
        );

        if (rank === null) {
            return res.status(404).json({
                message: "Player not found",
            });
        }

        const score = await redisClient.zScore(
            "leaderboard",
            playerId
        );

        res.json({
            playerId,
            rank: rank + 1,
            score,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get player rank",
        });
    }
});


export default router;