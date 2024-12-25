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

app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running");
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

