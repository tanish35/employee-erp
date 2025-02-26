import {
  registerEmployee,
  loginEmployee,
  getMe,
  addNextWeek,
  logOut,
  getSubordinates,
} from "../controllers/employeeController";
import checkAuth from "../middleware/checkAuth";
import express from "express";

const router = express.Router();

router.post("/register", registerEmployee);
router.post("/login", loginEmployee);
router.get("/me", checkAuth, getMe);
router.post("/addNextWeek", addNextWeek);
router.post("/logout", checkAuth, logOut);
router.get("/subordinates", checkAuth, getSubordinates);

export default router;
