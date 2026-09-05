import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connectRedis } from "./redis.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import viewsRoutes from "./routes/views.js";


const app=express();
app.use(express.json());


app.get("/",(req,res)=>{
    res.json({
        message:"Welcome to Redis Leaderboard API"
    })
});

app.use("/", viewsRoutes);


app.use("/leaderboard",leaderboardRoutes);


const PORT= process.env.PORT || 3000;
async function startServer(){
    await connectRedis();
    app.listen(PORT,()=>{
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
startServer();