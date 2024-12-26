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
          Submitted: true,
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
        Submitted: true,
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

export const get4Weeks = asyncHandler(async (req: Request, res: Response) => {
  //@ts-ignore
  const employeeId = req.employee.employeeId;
  //@ts-ignore
  const employee = req.employee;

  const weeks = [];

  // Current week's Monday
  const currentDate = new Date();
  const currentDayOfWeek = currentDate.getDay(); // Sunday = 0, Monday = 1, ...
  const daysSinceMonday = (currentDayOfWeek + 6) % 7; // Adjust for Monday start
  const mondayThisWeek = new Date(
    currentDate.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000
  );

  // Loop to fetch the previous and upcoming 4 weeks
  for (let i = -1; i < 4; i++) {
    const startOfWeek = new Date(
      mondayThisWeek.getTime() + i * 7 * 24 * 60 * 60 * 1000
    );
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);

    const weekData = await prisma.week.findFirst({
      where: {
        startDate: { lte: endOfWeek.toISOString() },
        endDate: { gte: startOfWeek.toISOString() },
      },
    });

    weeks.push(weekData); // Fallback to calculated dates if not found
  }

  res.status(200).json({ weeks });
});

export const handleWeeklyReportSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    const { actualWeeklyReport, week4Data } = req.body;
    //@ts-ignore
    const employeeId = req.employee.employeeId;
  }
);

export const addProjectData = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      projectName,
      projectDescription,
      week0Hours,
      week0ActualHours,
      week1Hours,
      week2Hours,
      week3Hours,
      week4Hours,
      category,
    } = req.body;
    //@ts-ignore
    const employeeId = req.employee.employeeId;
    if (!projectName || !projectDescription || !category) {
      res.status(400);
      throw new Error("All fields are required");
    }
    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: projectDescription,
        category,
        employeeId,
      },
    });
    const date = new Date();
    for (let i = -1; i < 4; i++) {
      const newDate = new Date(date.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const week = await prisma.week.findFirst({
        where: {
          startDate: { lte: newDate.toISOString() },
          endDate: { gte: newDate.toISOString() },
        },
      });
      console.log(week);
      if (week) {
        await prisma.weeklyReport.create({
          data: {
            weekId: week.weekId,
            projectId: project.projectId,
            Submitted: (
              i === -1
                ? week0Hours
                : i === 0
                ? week1Hours
                : i === 2
                ? week2Hours
                : i === 3
                ? week3Hours
                : i === 4
                ? week4Hours
                : 0
            )
              ? 1
              : 0, // Check if hours is truthy
            hours:
              i === -1
                ? parseInt(week0Hours, 10) || 0
                : i === 0
                ? parseInt(week1Hours, 10) || 0
                : i === 1
                ? parseInt(week2Hours, 10) || 0
                : i === 2
                ? parseInt(week3Hours, 10) || 0
                : i === 3
                ? parseInt(week4Hours, 10) || 0
                : 0, // Convert to integer or default to 0
            employeeId,
          },
        });
      }
    }
    if (week0ActualHours) {
      const newDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
      const week = await prisma.week.findFirst({
        where: {
          startDate: { lte: newDate.toISOString() },
          endDate: { gte: newDate.toISOString() },
        },
      });
      if (!week) {
        res.status(404).json({ message: "Week not found" });
        return;
      }
      await prisma.weeklyActualReport.create({
        data: {
          weekId: week.weekId,
          projectId: project.projectId,
          Submitted: 1,
          hours: parseInt(week0ActualHours, 10),
          employeeId,
        },
      });
    }
    res.status(201).json({ message: "Project and weekly reports added" });
  }
);

export const submitData = asyncHandler(async (req: Request, res: Response) => {
  const { actualWeekReports, week4Data } = req.body;
  //@ts-ignore
  const employeeId = req.employee.employeeId;
  const date = new Date();
  const prevDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
  actualWeekReports.forEach(async (report: any) => {
    const week = await prisma.week.findFirst({
      where: {
        startDate: { lte: prevDate.toISOString() },
        endDate: { gte: prevDate.toISOString() },
      },
    });
    if (!week) {
      res.status(404).json({ message: "Week not found" });
      return;
    }
    await prisma.weeklyActualReport.create({
      data: {
        weekId: week.weekId,
        projectId: report.projectId,
        hours: parseInt(report.hours, 10),
        Submitted: 1,
        employeeId,
      },
    });
  });
});

export const getWeek4Data = asyncHandler(
  async (req: Request, res: Response) => {
    //@ts-ignore
    const employeeId = req.employee.employeeId;
    const date = new Date();
    const week4Date = new Date(date.getTime() + 3 * 7 * 24 * 60 * 60 * 1000);
    const week = await prisma.week.findFirst({
      where: {
        startDate: { lte: week4Date.toISOString() },
        endDate: { gte: week4Date.toISOString() },
      },
    });
    if (!week) {
      res.status(404).json({ message: "Week not found" });
      return;
    }
    const weeklyReports = await prisma.weeklyReport.findMany({
      select: {
        weekId: true,
        projectId: true,
        hours: true,
        Submitted: true,
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
        weekId: week.weekId,
        employeeId,
      },
    });
    res.status(200).json({ reports: weeklyReports });
  }
);
