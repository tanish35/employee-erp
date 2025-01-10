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

// export const deleteProject = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { id } = req.body;
//     const project = await prisma.project.delete({
//       where: {
//         projectId: id,
//       },
//     });
//     res.status(200).json(project);
//   }
// );

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  //@ts-ignore
  const employeeId = req.employee.employeeId;
  const projects = await prisma.project.findMany({
    where: {
      employeeId: employeeId,
      completed: 0,
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
          endDate: { gt: currentDate },
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
        skip: 1, // Skip the first week
        take: 4, // Take the next 4 weeks
      });

      if (weeks.length === 0) {
        return res.status(404).json({ message: "No weeks found." });
      }

      const weekIds = weeks.map((week) => week.weekId);

      let weeklyReports = await prisma.weeklyReport.findMany({
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
          Project: {
            completed: 0,
          },
        },
        orderBy: {
          Week: {
            startDate: "asc",
          },
        },
      });

      // Check for projects that are not completed and do not have a report
      const projects = await prisma.project.findMany({
        where: {
          completed: 0,
        },
        select: {
          projectId: true,
        },
      });

      const projectIds = projects.map((project) => project.projectId);

      // For each project, check if a report exists, if not create one
      for (const projectId of projectIds) {
        const existingReport = weeklyReports.find(
          (report) => report.projectId === projectId
        );

        if (!existingReport) {
          for (const weekId of weekIds) {
            await prisma.weeklyReport.create({
              data: {
                weekId: weekId,
                projectId: projectId,
                employeeId: employeeId,
                hours: 0,
                Submitted: 0,
              },
            });
          }
        }
      }

      // Fetch updated reports after creation
      weeklyReports = await prisma.weeklyReport.findMany({
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
          Project: {
            completed: 0,
          },
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
  const prevDate = new Date(currentDate.getTime());

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
        endDate: { gt: isoPrevDate },
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
        Project: {
          completed: 0,
        },
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

    let actualWeeklyReport = await prisma.weeklyActualReport.findMany({
      where: {
        weekId: prevWeek.weekId,
        employeeId: employeeId,
        Project: {
          completed: 0,
        },
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

    if (actualWeeklyReport.length === 0) {
      const projects = await prisma.project.findMany({
        where: {
          employeeId,
          completed: 0,
        },
      });
      for (const project of projects) {
        await prisma.weeklyActualReport.create({
          data: {
            weekId: prevWeek.weekId,
            projectId: project.projectId,
            hours: 0,
            Submitted: 0,
            employeeId,
          },
        });
      }

      actualWeeklyReport = await prisma.weeklyActualReport.findMany({
        where: {
          weekId: prevWeek.weekId,
          employeeId: employeeId,
          Project: {
            completed: 0,
          },
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
    }

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
  for (let i = 0; i <= 4; i++) {
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
    for (let i = 0; i <= 4; i++) {
      const newDate = new Date(date.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const week = await prisma.week.findFirst({
        where: {
          startDate: { lte: newDate.toISOString() },
          endDate: { gt: newDate.toISOString() },
        },
      });
      // console.log(week);
      if (week) {
        await prisma.weeklyReport.create({
          data: {
            weekId: week.weekId,
            projectId: project.projectId,
            hours:
              i === 0
                ? parseInt(week0Hours, 10) || 0
                : i === 1
                ? parseInt(week1Hours, 10) || 0
                : i === 2
                ? parseInt(week2Hours, 10) || 0
                : i === 3
                ? parseInt(week3Hours, 10) || 0
                : i === 4
                ? parseInt(week4Hours, 10) || 0
                : 0, // Convert to integer or default to 0
            employeeId,
          },
        });
      }
    }
    if (week0ActualHours) {
      const newDate = new Date(date.getTime());
      const week = await prisma.week.findFirst({
        where: {
          startDate: { lte: newDate.toISOString() },
          endDate: { gt: newDate.toISOString() },
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
          hours: parseInt(week0ActualHours, 10),
          employeeId,
        },
      });
    }
    res.status(201).json({ message: "Project and weekly reports added" });
  }
);

export const submitData = asyncHandler(async (req: Request, res: Response) => {
  const { actualWeekReports, prevWeekReports, weeklyReports } = req.body;

  //@ts-ignore
  const employeeId = req.employee.employeeId;

  //@ts-ignore
  const transactionPromises = [];

  // Handle ActualWeekReports for actualWeekReports
  if (actualWeekReports && actualWeekReports.length > 0) {
    actualWeekReports.forEach((report: any) => {
      const { weekId, projectId, hours } = report;
      transactionPromises.push(
        prisma.weeklyActualReport.updateMany({
          where: {
            employeeId,
            weekId,
            projectId,
          },
          data: {
            Submitted: 1,
            hours: hours, // Update the hours as well
          },
        })
      );
    });
  }

  // Handle WeeklyReports for prevWeekReports (same as actual reports)
  if (prevWeekReports && prevWeekReports.length > 0) {
    prevWeekReports.forEach((report: any) => {
      const { weekId, projectId, hours } = report;
      transactionPromises.push(
        prisma.weeklyReport.updateMany({
          where: {
            weekId,
            projectId,
          },
          data: {
            Submitted: 1,
            hours: hours, // Update the hours as well
          },
        })
      );
    });
  }

  // Handle WeeklyReports for nested reports in weeklyReports
  if (weeklyReports && Object.keys(weeklyReports).length > 0) {
    Object.keys(weeklyReports).forEach((weekKey) => {
      const weekData = weeklyReports[weekKey];
      const { reports } = weekData;

      // Add reports to transaction
      reports.forEach((report: any) => {
        const { weekId, projectId, hours } = report;
        transactionPromises.push(
          prisma.weeklyReport.updateMany({
            where: {
              weekId,
              projectId,
            },
            data: {
              Submitted: 1,
              hours: hours, // Update the hours as well
            },
          })
        );
      });
    });
  }

  //@ts-ignore
  await prisma.$transaction(transactionPromises);

  res.status(200).json({ message: "Submission updated successfully!" });
});

export const getWeek4Data = asyncHandler(
  async (req: Request, res: Response) => {
    //@ts-ignore
    const employeeId = req.employee.employeeId;
    const date = new Date();
    const week4Date = new Date(date.getTime() + 4 * 7 * 24 * 60 * 60 * 1000);
    const week = await prisma.week.findFirst({
      where: {
        startDate: { lte: week4Date.toISOString() },
        endDate: { gt: week4Date.toISOString() },
      },
    });
    if (!week) {
      res.status(404).json({ message: "Week not found" });
      return;
    }
    let weeklyReports;
    weeklyReports = await prisma.weeklyReport.findMany({
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
        Project: {
          completed: 0,
        },
      },
    });
    if (weeklyReports.length === 0) {
      const projects = await prisma.project.findMany({
        where: {
          employeeId,
          completed: 0,
        },
      });
      for (const project of projects) {
        await prisma.weeklyReport.create({
          data: {
            weekId: week.weekId,
            projectId: project.projectId,
            hours: 0,
            Submitted: 0,
            employeeId,
          },
        });
      }
    }
    weeklyReports = await prisma.weeklyReport.findMany({
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
        Project: {
          completed: 0,
        },
      },
    });
    res.status(200).json({ reports: weeklyReports });
  }
);

export const addLeaveData = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      week0Hours,
      week0ActualHours,
      week1Hours,
      week2Hours,
      week3Hours,
      week4Hours,
    } = req.body;

    if (
      !week0Hours ||
      !week1Hours ||
      !week2Hours ||
      !week3Hours ||
      !week4Hours ||
      !week0ActualHours
    ) {
      res.status(400);
      throw new Error("All fields are required");
    }

    //@ts-ignore
    const employeeId = req.employee.employeeId;

    for (let i = 0; i <= 4; i++) {
      const date = new Date();
      const newDate = new Date(date.getTime() + i * 7 * 24 * 60 * 60 * 1000);

      const week = await prisma.week.findFirst({
        where: {
          startDate: { lte: newDate.toISOString() },
          endDate: { gt: newDate.toISOString() },
        },
      });

      if (week) {
        const weekId = week.weekId;

        // Find existing leave data for the same week and employee
        const existingLeave = await prisma.leaves.findFirst({
          where: {
            weekId,
            employeeId,
          },
        });

        if (existingLeave) {
          // If it exists, add to the existing hours
          await prisma.leaves.update({
            where: { leaveId: existingLeave.leaveId },
            data: {
              hours:
                existingLeave.hours +
                7.0 *
                  parseFloat(
                    i === -1
                      ? week0Hours
                      : i === 0
                      ? week1Hours
                      : i === 1
                      ? week2Hours
                      : i === 2
                      ? week3Hours
                      : week4Hours
                  ),
            },
          });
        } else {
          // If it does not exist, create a new leave record
          await prisma.leaves.create({
            data: {
              weekId,
              employeeId,
              hours:
                7.0 *
                  parseFloat(
                    i === -1
                      ? week0Hours
                      : i === 0
                      ? week1Hours
                      : i === 1
                      ? week2Hours
                      : i === 2
                      ? week3Hours
                      : week4Hours
                  ) || 0,
            },
          });
        }
      }
    }
    const date = new Date();
    const newDate = new Date(date.getTime());
    const week0 = await prisma.week.findFirst({
      where: {
        startDate: { lte: newDate.toISOString() },
        endDate: { gt: newDate.toISOString() },
      },
    });

    if (!week0) {
      res.status(404).json({ message: "Week not found" });
      return;
    }

    const existingLeaves = await prisma.actualLeaves.findFirst({
      where: {
        weekId: week0.weekId,
        employeeId,
      },
    });
    // console.log(existingLeaves);

    if (existingLeaves) {
      await prisma.actualLeaves.update({
        where: { leaveId: existingLeaves.leaveId },
        data: {
          hours: existingLeaves.hours + 7.0 * parseFloat(week0ActualHours) || 0,
        },
      });
      // console.log(week0ActualHours);
    } else {
      await prisma.actualLeaves.create({
        data: {
          weekId: week0.weekId,
          employeeId,
          hours: 7.0 * parseFloat(week0ActualHours) || 0,
        },
      });
    }

    res
      .status(201)
      .json({ message: "Leave data added or updated successfully" });
  }
);

export const get4WeeksLeaves = asyncHandler(
  async (req: Request, res: Response) => {
    //@ts-ignore
    const employeeId = req.employee.employeeId;
    //@ts-ignore
    const employee = req.employee;

    const leaves = [];

    for (let i = 0; i <= 4; i++) {
      const date = new Date();
      const newDate = new Date(date.getTime() + i * 7 * 24 * 60 * 60 * 1000);

      const week = await prisma.week.findFirst({
        where: {
          startDate: { lte: newDate.toISOString() },
          endDate: { gt: newDate.toISOString() },
        },
      });

      let leave;

      if (week) {
        const weekId = week.weekId;

        leave = await prisma.leaves.findFirst({
          where: {
            weekId,
            employeeId,
          },
        });
        if (!leave) {
          leave = await prisma.leaves.create({
            data: {
              weekId,
              employeeId,
              hours: 0,
            },
          });
        }

        leaves.push(leave);
      }
    }
    res.status(200).json({ leaves });
  }
);

export const unlockAll = asyncHandler(async (req: Request, res: Response) => {
  const response = await prisma.weeklyReport.updateMany({
    data: {
      Submitted: 0,
    },
  });
  const response2 = await prisma.weeklyActualReport.updateMany({
    data: {
      Submitted: 0,
    },
  });
  res.status(200).json("All reports unlocked");
});

export const saveNewProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, category, hours } = req.body;
    if (!name || !description || !category || !hours) {
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
    const date = new Date();
    let newDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
    const week0 = await prisma.week.findFirst({
      where: {
        startDate: { lte: newDate.toISOString() },
        endDate: { gt: newDate.toISOString() },
      },
    });
    if (!week0) {
      res.status(404).json({ message: "Week not found" });
      return;
    }
    await prisma.weeklyReport.create({
      data: {
        weekId: week0.weekId,
        projectId: project.projectId,
        hours: hours.prevWeek.value,
        employeeId,
      },
    });
    await prisma.weeklyActualReport.create({
      data: {
        weekId: week0.weekId,
        projectId: project.projectId,
        hours: hours.actual.value,
        employeeId,
      },
    });
    const week1 = await prisma.week.findFirst({
      where: {
        startDate: { lte: date.toISOString() },
        endDate: { gt: date.toISOString() },
      },
    });
    if (!week1) {
      res.status(404).json({ message: "Week not found" });
      return;
    }
    await prisma.weeklyReport.create({
      data: {
        weekId: week1.weekId,
        projectId: project.projectId,
        hours: hours.week1.value,
        employeeId,
      },
    });
    newDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    const week2 = await prisma.week.findFirst({
      where: {
        startDate: { lte: newDate.toISOString() },
        endDate: { gt: newDate.toISOString() },
      },
    });
    if (!week2) {
      res.status(404).json({ message: "Week not found" });
      return;
    }
    await prisma.weeklyReport.create({
      data: {
        weekId: week2.weekId,
        projectId: project.projectId,
        hours: hours.week2.value,
        employeeId,
      },
    });
    newDate = new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000);
    const week3 = await prisma.week.findFirst({
      where: {
        startDate: { lte: newDate.toISOString() },
        endDate: { gt: newDate.toISOString() },
      },
    });
    if (!week3) {
      res.status(404).json({ message: "Week not found" });
      return;
    }
    await prisma.weeklyReport.create({
      data: {
        weekId: week3.weekId,
        projectId: project.projectId,
        hours: hours.week3.value,
        employeeId,
      },
    });
    newDate = new Date(date.getTime() + 21 * 24 * 60 * 60 * 1000);
    const week4 = await prisma.week.findFirst({
      where: {
        startDate: { lte: newDate.toISOString() },
        endDate: { gt: newDate.toISOString() },
      },
    });
    if (!week4) {
      res.status(404).json({ message: "Week not found" });
      return;
    }
    await prisma.weeklyReport.create({
      data: {
        weekId: week4.weekId,
        projectId: project.projectId,
        hours: hours.week4.value,
        employeeId,
      },
    });
    res.status(201).json({ message: "Project added" });
  }
);

export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectId } = req.body;
    const project = await prisma.project.update({
      data: {
        completed: 1,
      },
      where: {
        projectId,
      },
    });
    res.status(200).json(project);
  }
);

export const getActualLeaves = asyncHandler(
  async (req: Request, res: Response) => {
    const date = new Date();
    const newDate = new Date(date.getTime());
    //@ts-ignore
    const employeeId = req.employee.employeeId;
    const week0 = await prisma.week.findFirst({
      where: {
        startDate: { lte: newDate.toISOString() },
        endDate: { gt: newDate.toISOString() },
      },
    });

    if (!week0) {
      res.status(404).json({ message: "Week not found" });
      return;
    }

    let actualLeave = await prisma.actualLeaves.findFirst({
      where: {
        weekId: week0.weekId,
        employeeId,
      },
    });

    if (!actualLeave) {
      await prisma.actualLeaves.create({
        data: {
          weekId: week0.weekId,
          employeeId,
          hours: 0,
        },
      });
      actualLeave = await prisma.actualLeaves.findFirst({
        where: {
          weekId: week0.weekId,
          employeeId,
        },
      });
    }

    res.status(200).json({ actualLeave });
  }
);

export const updateLeave = asyncHandler(async (req: Request, res: Response) => {
  const { weekId, action } = req.body;
  //@ts-ignore
  const employeeId = req.employee.employeeId;
  const leave = await prisma.leaves.findFirst({
    where: {
      weekId,
      employeeId,
    },
  });
  if (!leave) {
    if (action == "remove") {
      res.status(404).json({ message: "Leave not found" });
      return;
    }
    await prisma.leaves.create({
      data: {
        weekId,
        employeeId,
        hours: 7,
      },
    });
    res.status(201).json({ message: "Leave added" });
    return;
  }
  if (action == "add") {
    await prisma.leaves.update({
      where: {
        leaveId: leave.leaveId,
      },
      data: {
        hours: leave.hours + 7,
      },
    });
  }
  if (action == "remove") {
    await prisma.leaves.update({
      where: {
        leaveId: leave.leaveId,
      },
      data: {
        hours: leave.hours - 7,
      },
    });
  }
  res.status(200).json({ message: "Leave updated" });
});

export const updateActualLeave = asyncHandler(
  async (req: Request, res: Response) => {
    const { weekId, action } = req.body;
    //@ts-ignore
    const employeeId = req.employee.employeeId;
    const leave = await prisma.actualLeaves.findFirst({
      where: {
        weekId,
        employeeId,
      },
    });
    if (!leave) {
      if (action == "remove") {
        res.status(404).json({ message: "Leave not found" });
        return;
      }
      await prisma.actualLeaves.create({
        data: {
          weekId,
          employeeId,
          hours: 7,
        },
      });
      res.status(201).json({ message: "Leave added" });
      return;
    }
    if (action == "add") {
      await prisma.actualLeaves.update({
        where: {
          leaveId: leave.leaveId,
        },
        data: {
          hours: leave.hours + 7,
        },
      });
    }
    if (action == "remove") {
      await prisma.actualLeaves.update({
        where: {
          leaveId: leave.leaveId,
        },
        data: {
          hours: leave.hours - 7,
        },
      });
    }
    res.status(200).json({ message: "Leave updated" });
  }
);
