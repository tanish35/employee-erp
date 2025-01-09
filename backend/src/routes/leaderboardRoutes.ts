import { getLeaderboard } from "../controllers/leaderboardController";

import express from "express";

const router = express.Router();

router.get("/getLeaderboard", getLeaderboard);

export default router;
