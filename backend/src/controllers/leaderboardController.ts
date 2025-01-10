import { Request, Response } from "express";
import prisma from "../lib/prisma";
import asyncHandler from "express-async-handler";

export const getLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const currentDate = new Date();

    const currentWeek = await prisma.week.findFirst({
      where: {
        startDate: {
          lte: currentDate,
        },
        endDate: {
          gte: currentDate,
        },
      },
    });

    if (!currentWeek) {
      res.status(404).json({ message: "No current week found" });
      return;
    }

    const employees = await prisma.employee.findMany({
      include: {
        WeeklyActualReport: {
          where: { weekId: currentWeek.weekId },
        },
        ActualLeaves: {
          where: { weekId: currentWeek.weekId },
        },
        WeeklyReport: {
          where: { weekId: currentWeek.weekId },
        },
      },
    });

    const leaderboard = employees.map((employee) => {
      const actualHours = employee.WeeklyActualReport.reduce(
        (sum, report) => sum + report.hours,
        0
      );
      const leaveHours = employee.ActualLeaves.reduce(
        (sum, leave) => sum + leave.hours,
        0
      );
      const plannedHours = employee.WeeklyReport.reduce(
        (sum, report) => sum + report.hours,
        0
      );
      const effectiveHours = currentWeek.availableHours - leaveHours;
      const capacityPercentage = (actualHours / effectiveHours) * 100;

      return {
        id: employee.employeeId,
        name: employee.name,
        plannedHours,
        actualHours,
        leaveHours,
        effectiveHours,
        capacityPercentage: Math.round(capacityPercentage * 100) / 100,
      };
    });

    const sortedLeaderboard = leaderboard.sort(
      (a, b) => b.capacityPercentage - a.capacityPercentage
    );

    const top3 = sortedLeaderboard.slice(0, 3);
    const bottom3 = sortedLeaderboard
      .filter(
        (employee) =>
          !top3.some((topEmployee) => topEmployee.id === employee.id)
      )
      .slice(-3);
    const newLeaderboard = top3.concat(bottom3);

    res.status(200).json({ leaderboard: newLeaderboard, currentWeek });
  }
);
