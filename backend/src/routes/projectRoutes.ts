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
  submitData,
  addLeaveData,
  get4WeeksLeaves,
  unlockAll,
  saveNewProject,
  getActualLeaves,
  updateLeave,
  updateActualLeave,
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
router.post("/submitData", checkAuth, submitData);
router.post("/addLeaveData", checkAuth, addLeaveData);
router.get("/get4WeeksLeaves", checkAuth, get4WeeksLeaves);
router.get("/unlockAll", checkAuth, unlockAll);
router.post("/saveNewProject", checkAuth, saveNewProject);
router.get("/getActualLeaves", checkAuth, getActualLeaves);
router.post("/updateLeave", checkAuth, updateLeave);
router.post("/updateActualLeave", checkAuth, updateActualLeave);

export default router;
