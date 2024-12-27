import express from 'express';
import { Request,Response } from 'express';
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import employeeRoutes from "./routes/employeeRoutes";
import projectRoutes from "./routes/projectRoutes";



const app = express();
app.use(express.json());
const corsOptions = {
  origin: [
    "http://localhost:3001",
    "http://localhost:5173",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/employee", employeeRoutes);
app.use("/project", projectRoutes);

const port = process.env.PORT;

import { InstalledClock, install } from "@sinonjs/fake-timers";

let clock: InstalledClock = install({
  now: Date.now(),
  toFake: ["Date", "setTimeout", "clearTimeout"],
});

//@ts-ignore
app.post("/simulate-time", (req: Request, res: Response) => {
  const { offset }: { offset: number } = req.body;

  if (typeof offset === "number") {
    clock.setSystemTime(Date.now() + offset*86400000);
    return res.json({
      message: `Time simulated to ${new Date().toISOString()}`,
    });
  }

  return res.status(400).json({ error: "Offset is required and must be a number" });
});

// Endpoint to get the current simulated time
app.get("/current-time", (_req: Request, res: Response) => {
  res.json({ simulatedTime: new Date().toISOString() });
});
app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running");
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

