import { Request, Response } from "express";
import prisma from "../lib/prisma";
import asyncHandler from "express-async-handler";

export const getLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const currentDate = new Date();

    const prevWeek = await prisma.week.findFirst({
      where: {
        startDate: {
          lte: currentDate,
        },
        endDate: {
          gte: currentDate,
        },
      },
    });

    if (!prevWeek) {
      res.status(400).json({ error: "No data found" });
      return;
    }

    const employees = await prisma.employee.findMany({
      include: {
        WeeklyActualReport: {
          where: { weekId: prevWeek.weekId },
        },
        ActualLeaves: {
          where: { weekId: prevWeek.weekId },
        },
      },
    });

    const leaderboard = employees.map((employee) => {
      const totalHoursWorked = employee.WeeklyActualReport.reduce(
        (sum, report) => sum + report.hours,
        0
      );
      const leaveHours = employee.ActualLeaves.reduce(
        (sum, leave) => sum + leave.hours,
        0
      );
      const effectiveHours = prevWeek.availableHours - leaveHours;
      const capacityPercentage = (totalHoursWorked / effectiveHours) * 100;

      return {
        id: employee.employeeId,
        name: employee.name,
        capacityPercentage: Math.round(capacityPercentage * 100) / 100,
        totalHoursWorked,
        effectiveHours,
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

    res.status(200).json({ top3, bottom3, prevWeek });
  }
);
