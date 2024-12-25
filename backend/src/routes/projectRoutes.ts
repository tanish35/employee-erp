import {
  addProject,
  deleteProject,
  getProjects,
  getMonthlyReport,
  setWeeklyReport,
  addWeek,
  getPrevWeek,
  getSetWeek,
} from "../controllers/projectController";
import checkAuth from "../middleware/checkAuth";
import express from "express";

const router = express.Router();

router.post("/addProject", checkAuth, addProject);
router.post("/deleteProject", checkAuth, deleteProject);
router.get("/getProjects", checkAuth, getProjects);
router.get("/getMonthlyReport", checkAuth, getMonthlyReport);
router.post("/setWeeklyReport", checkAuth, setWeeklyReport);
router.post("/addWeek", checkAuth, addWeek);
router.get("/getPrevWeek", checkAuth, getPrevWeek);
router.get("/getSetWeek", checkAuth, getSetWeek);

export default router;
