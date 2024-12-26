import {
  registerEmployee,
  loginEmployee,
  getMe,
  addNextWeek,
} from "../controllers/employeeController";
import checkAuth from "../middleware/checkAuth";
import express from "express";

const router = express.Router();

router.post("/register", registerEmployee);
router.post("/login", loginEmployee);
router.get("/me", checkAuth, getMe);
router.post("/addNextWeek", addNextWeek);

export default router;
