import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const addProject = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, category } = req.body;
  if (!name || !description || !category) {
    res.status(400);
    throw new Error("All fields are required");
  }
  //@ts-ignore
  const employeeId = req.employee.employeeId;
  const project = await prisma.project.create({
    data: {
      category,
      name,
      description,
      employeeId,
    },
  });
  res.status(201).json(project);
});

export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.body;
    const project = await prisma.project.delete({
      where: {
        projectId: id,
      },
    });
    res.status(200).json(project);
  }
);

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  //@ts-ignore
  const employeeId = req.employee.employeeId;
  const projects = await prisma.project.findMany({
    where: {
      employeeId: employeeId,
    },
  });
  res.status(200).json(projects);
});

export const getMonthlyReport = asyncHandler(
  //@ts-ignore
  async (req: Request, res: Response) => {
    //@ts-ignore
    const employeeId = req.employee.employeeId;
    //@ts-ignore
    const employee = req.employee;

    try {
      const currentDate = new Date();

      const currentWeek = await prisma.week.findFirst({
        where: {
          startDate: { lte: currentDate },
          endDate: { gte: currentDate },
        },
      });

      if (!currentWeek) {
        return res.status(404).json({ message: "Current week not found." });
      }

      const weeks = await prisma.week.findMany({
        where: {
          startDate: { gte: currentWeek.startDate },
        },
        orderBy: {
          startDate: "asc",
        },
        take: 5,
      });

      if (weeks.length === 0) {
        return res.status(404).json({ message: "No weeks found." });
      }

      const weekIds = weeks.map((week) => week.weekId);

      const weeklyReports = await prisma.weeklyReport.findMany({
        select: {
          weekId: true,
          projectId: true,
          hours: true,
          Project: {
            select: {
              name: true,
              description: true,
              category: true,
            },
          },
          Week: {
            select: {
              startDate: true,
              endDate: true,
              availableHours: true,
            },
          },
        },
        where: {
          weekId: { in: weekIds },
          employeeId: employeeId,
        },
        orderBy: {
          Week: {
            startDate: "asc",
          },
        },
      });

      res.status(200).json({ weeklyReports, employee });
    } catch (error) {
      console.error("Error fetching weekly reports:", error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching weekly reports." });
    }
  }
);

export const setWeeklyReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { weekId, projectId, hours } = req.body;
    //@ts-ignore
    const employeeId = req.employee.employeeId;
    if (!weekId || !projectId || !hours) {
      res.status(400);
      throw new Error("All fields are required");
    }
    const weeklyReport = await prisma.weeklyReport.create({
      data: {
        weekId,
        projectId,
        hours,
        employeeId,
      },
    });
    res.status(201).json(weeklyReport);
  }
);

export const addWeek = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, availableHours } = req.body;
  if (!startDate || !endDate || !availableHours) {
    res.status(400);
    throw new Error("All fields are required");
  }
  const week = await prisma.week.create({
    data: {
      startDate,
      endDate,
      availableHours,
    },
  });
  res.status(201).json(week);
});

export const getSetWeek = asyncHandler(async (req: Request, res: Response) => {
  const date = new Date();
  const nextMonth = new Date(date.setMonth(date.getMonth() + 1));
  const week = await prisma.week.findFirst({
    where: {
      startDate: { gte: date.toISOString() },
      endDate: { lte: nextMonth.toISOString() },
    },
  });
  if (!week) {
    const newWeek = await prisma.week.create({
      data: {
        startDate: date.toISOString(),
        endDate: nextMonth.toISOString(),
        availableHours: 40,
      },
    });
    res.status(201).json(newWeek);
    return;
  }
  res.status(200).json(week);
  return;
});

//@ts-ignore
export const getPrevWeek = asyncHandler(async (req: Request, res: Response) => {
  const currentDate = new Date();

  // Get the previous week's date
  const prevDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Convert to ISO string to ensure correct format
  const isoPrevDate = prevDate.toISOString();

  //   console.log(isoPrevDate);

  //@ts-ignore
  const employeeId = req.employee.employeeId;
  //@ts-ignore
  const employee = req.employee;

  try {
    const prevWeek = await prisma.week.findFirst({
      where: {
        startDate: { lte: isoPrevDate },
        endDate: { gte: isoPrevDate },
      },
    });

    const allWeeks = await prisma.week.findMany();
    // console.log(allWeeks);

    if (!prevWeek) {
      return res.status(404).json({ message: "Previous week not found." });
    }

    const weeklyReports = await prisma.weeklyReport.findMany({
      where: {
        weekId: prevWeek.weekId,
        employeeId: employeeId,
      },
      select: {
        weekId: true,
        projectId: true,
        hours: true,
        Project: {
          select: {
            name: true,
            description: true,
            category: true,
          },
        },
        Week: {
          select: {
            startDate: true,
            endDate: true,
            availableHours: true,
          },
        },
      },
      orderBy: {
        Week: {
          startDate: "asc",
        },
      },
    });

    const actualWeeklyReport = await prisma.weeklyActualReport.findMany({
      where: {
        weekId: prevWeek.weekId,
        employeeId: employeeId,
      },
      select: {
        weekId: true,
        projectId: true,
        hours: true,
        Project: {
          select: {
            name: true,
            description: true,
            category: true,
          },
        },
        Week: {
          select: {
            startDate: true,
            endDate: true,
            availableHours: true,
          },
        },
      },
      orderBy: {
        Week: {
          startDate: "asc",
        },
      },
    });

    res.status(200).json({ weeklyReports, employee, actualWeeklyReport });
  } catch (error) {
    console.error("Error fetching previous week's report:", error);
    res.status(500).json({
      message: "An error occurred while fetching previous week's report.",
    });
  }
});
