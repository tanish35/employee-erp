import { getHistory } from "../controllers/historyController";

import checkAuth from "../middleware/checkAuth";
import express from "express";

const router = express.Router();

router.get("/getHistory", checkAuth, getHistory);

export default router;
