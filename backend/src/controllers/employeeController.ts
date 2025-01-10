import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";

export const registerEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, role, managerId, subordinateId } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400);
      throw new Error("All fields are required");
    }

    if (!process.env.SECRET) {
      res.status(500);
      throw new Error("Internal Server Error");
    }

    const employeeExists = await prisma.employee.findUnique({
      where: { email },
    });
    if (employeeExists) {
      res.status(400);
      throw new Error("Employee already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    if (managerId || subordinateId) {
      await updateHierarchyForNewEmployee(
        employee.employeeId,
        managerId,
        subordinateId
      );
    }
    res.status(201).json(employee);
  }
);

export const loginEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }
    if (!process.env.SECRET) {
      res.status(500);
      throw new Error("Internal Server Error");
    }
    const employee = await prisma.employee.findUnique({
      where: {
        email,
      },
    });
    if (!employee) {
      res.status(404);
      throw new Error("Employee not found");
    }
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }
    const exp = Date.now() + 1000 * 60 * 60 * 24 * 30;
    const token = jwt.sign(
      { sub: employee.employeeId, exp },
      process.env.SECRET
    );
    res.cookie("Authorization", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.status(200).json({ message: "Login successful" });
  }
);

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!process.env.SECRET) {
    res.status(500);
    throw new Error("Internal Server Error");
  }
  // @ts-ignore
  const employee = req.employee;
  if (!employee) {
    res.status(401);
    throw new Error("Not authorized");
  }
  res.status(200).json(employee);
});

export const addNextWeek = asyncHandler(async (req: Request, res: Response) => {
  const { availableHours } = req.body;
  if (!availableHours) {
    res.status(400);
    throw new Error("All fields are required");
  }
  if (!process.env.SECRET) {
    res.status(500);
    throw new Error("Internal Server Error");
  }
  const lastWeek = await prisma.week.findMany({
    orderBy: {
      startDate: "desc",
    },
    take: 1,
  });
  const nextWeekStartDate = new Date(
    lastWeek[0].startDate.getTime() + 7 * 24 * 60 * 60 * 1000
  );
  const nextWeekEndDate = new Date(
    lastWeek[0].endDate.getTime() + 7 * 24 * 60 * 60 * 1000
  );
  await prisma.week.create({
    data: {
      startDate: nextWeekStartDate.toISOString(),
      endDate: nextWeekEndDate.toISOString(),
      availableHours: parseInt(availableHours),
    },
  });
  res.status(201).json({ message: "Week added" });
});

// export const history = asyncHandler(async (req: Request, res: Response) => {
//   const { startDate, endDate } = req.body;
//   if (!startDate || !endDate) {
//     res.status(400);
//     throw new Error("All fields are required");
//   }
//   if (!process.env.SECRET) {
//     res.status(500);
//     throw new Error("Internal Server Error");
//   }
//   // @ts-ignore
//   const employeeId = req.employee.employeeId;

//   const predictedReports = await prisma.weeklyReport.findMany({
//     select: {
//       Project: {
//         select: {
//           name: true,
//           description: true,
//           category: true,
//         },
//       },
//       hours: true,
//       Week: {
//         select: {
//           startDate: true,
//           endDate: true,
//         },
//       },
//     },
//     where: {
//       employeeId,
//       Week: {
//         startDate: { gte: new Date(startDate) },
//         endDate: { lte: new Date(endDate) },
//       },
//     },
//     orderBy: {
//       Week: {
//         startDate: "asc",
//       },
//     },
//   });

//   const actualReports = await prisma.weeklyActualReport.findMany({
//     select: {
//       Project: {
//         select: {
//           name: true,
//           description: true,
//           category: true,
//         },
//       },
//       hours: true,
//       Week: {
//         select: {
//           startDate: true,
//           endDate: true,
//         },
//       },
//     },
//     where: {
//       employeeId,
//       Week: {
//         startDate: { gte: new Date(startDate) },
//         endDate: { lte: new Date(endDate) },
//       },
//     },
//     orderBy: {
//       Week: {
//         startDate: "asc",
//       },
//     },
//   });
// });

export const getSubordinates = asyncHandler(
  async (req: Request, res: Response) => {
    // @ts-ignore
    const employeeId = req.employee.employeeId;
    const subordinates = await prisma.employee.findUnique({
      where: {
        employeeId,
      },
      select: {
        managing: true,
      },
    });
    res.status(200).json(subordinates);
  }
);

export const logOut = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("Authorization");
  res.status(200).json({ message: "Logged out" });
});

async function updateHierarchyForNewEmployee(
  employeeId: string,
  managerId?: string,
  subordinateId?: string
) {
  let manager = null;
  let subordinate = null;

  // Fetch direct manager details if provided
  if (managerId) {
    manager = await prisma.employee.findUnique({
      where: { employeeId: managerId },
      include: { managedBy: true }, // Higher-level managers
    });
  }

  // Fetch subordinate details if provided
  if (subordinateId) {
    subordinate = await prisma.employee.findUnique({
      where: { employeeId: subordinateId },
      include: { managing: true }, // Subordinate's direct subordinates
    });
  }

  // Step 1: Add new employee (`K`) to manager's `managing` array
  if (manager) {
    await prisma.employee.update({
      where: { employeeId: managerId },
      data: {
        managing: {
          connect: { employeeId },
        },
      },
    });

    // Step 2: Add `K` to all higher-level managers' `managing` arrays
    for (const higherManager of manager.managedBy) {
      await prisma.employee.update({
        where: { employeeId: higherManager.employeeId },
        data: {
          managing: {
            connect: { employeeId },
          },
        },
      });
    }
  }

  // Step 3: Add new employee (`K`) to subordinate's `managedBy` array
  if (subordinate) {
    await prisma.employee.update({
      where: { employeeId: subordinateId },
      data: {
        managedBy: {
          connect: { employeeId },
        },
      },
    });
  }

  // Step 4: Update `K`'s own `managedBy` and `managing` arrays
  await prisma.employee.update({
    where: { employeeId },
    data: {
      managedBy: manager
        ? {
            connect: [
              { employeeId: managerId },
              ...manager.managedBy.map((m) => ({ employeeId: m.employeeId })),
            ],
          }
        : undefined,
      managing: subordinate
        ? {
            connect: [
              { employeeId: subordinateId },
              ...subordinate.managing.map((s) => ({
                employeeId: s.employeeId,
              })),
            ],
          }
        : undefined,
    },
  });
}
