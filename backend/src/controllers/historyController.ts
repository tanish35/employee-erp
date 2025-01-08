import { Request, Response } from "express";
import prisma from "../lib/prisma";
import asyncHandler from "express-async-handler";

interface RequestWithEmployee extends Request {
  employee: {
    employeeId: string;
  };
}

//@ts-ignore
export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  let endDate1 = new Date(endDate as string);
  endDate1.setDate(endDate1.getDate() + 3);

  const { employeeId } = (req as RequestWithEmployee).employee;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Start date and end date are required" });
  }

  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  const weeks = await prisma.week.findMany({
    where: {
      OR: [
        {
          startDate: { lte: end },
          endDate: { gte: start },
        },
      ],
      WeeklyActualReport: {
        some: { employeeId },
      },
    },
    orderBy: { startDate: "asc" },
    include: {
      WeeklyActualReport: {
        where: { employeeId },
        include: { Project: true },
      },
      ActualLeaves: {
        where: { employeeId },
      },
    },
  });

  const projects = await prisma.project.findMany({
    where: {
      WeeklyActualReport: {
        some: {
          employeeId,
          Week: {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        },
      },
    },
  });

  const historyData = weeks.map((week) => {
    const totalProjectHours = week.WeeklyActualReport.reduce(
      (sum, report) => sum + report.hours,
      0
    );
    const totalLeaveHours = week.ActualLeaves.reduce(
      (sum, leave) => sum + leave.hours,
      0
    );
    const totalEffectiveHours = week.availableHours - totalLeaveHours;
    const capacityUsed =
      totalEffectiveHours > 0
        ? (totalProjectHours / totalEffectiveHours) * 100
        : 0;

    const projectData = projects.map((project) => {
      const projectReport = week.WeeklyActualReport.find(
        (report) => report.projectId === project.projectId
      );
      return {
        projectId: project.projectId,
        projectCategory: project.category,
        projectName: project.name,
        projectHours: projectReport ? projectReport.hours : 0,
        projectDescription: project.description,
      };
    });

    return {
      weekId: week.weekId,
      startDate: week.startDate,
      endDate: new Date(week.endDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      projectData,
      totalProjectHours,
      totalLeaveHours,
      totalEffectiveHours,
      capacityUsed: capacityUsed.toFixed(2),
    };
  });

  const categoryData = projects.reduce(
  (categories: { [key: string]: number }, project) => {
    if (!categories["All"]) {
      categories["All"] = 0;
    }
    if (!categories[project.category]) {
      categories[project.category] = 0;
    }
    weeks.forEach((week) => {
      const projectReport = week.WeeklyActualReport.find(
        (report) => report.projectId === project.projectId
      );
      if (projectReport) {
        categories[project.category] += projectReport.hours;
        categories["All"] += projectReport.hours;
      }
    });

    return categories;
  },
  {}
);

res.json({ historyData, categoryData });

});
