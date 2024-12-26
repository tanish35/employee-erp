import {
  addProject,
  deleteProject,
  getProjects,
  getMonthlyReport,
  setWeeklyReport,
  addWeek,
  getPrevWeek,
  getSetWeek,
  get4Weeks,
  addProjectData,
  getWeek4Data,
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
router.get("/get4Weeks", checkAuth, get4Weeks);
router.post("/addProjectData", checkAuth, addProjectData);
router.get("/getWeek4Data", checkAuth, getWeek4Data);

export default router;
