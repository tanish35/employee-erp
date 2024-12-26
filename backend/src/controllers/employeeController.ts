import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";

export const registerEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400);
      throw new Error("All fields are required");
    }
    if (!process.env.SECRET) {
      res.status(500);
      throw new Error("Internal Server Error");
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const employeeExists = await prisma.employee.findUnique({
      where: {
        email,
      },
    });
    if (employeeExists) {
      res.status(400);
      throw new Error("Employee already exists");
    }
    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
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
