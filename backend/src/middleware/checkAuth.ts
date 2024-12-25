import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
// @ts-ignore
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.Authorization;
    // @ts-ignore
    const decoded = jwt.verify(token, process.env.SECRET);
    // @ts-ignore
    if (Date.now() >= decoded.exp) {
      res.sendStatus(410);
      return;
    }
    const userId = decoded.sub;
    if (!userId) {
      res.sendStatus(401);
      return;
    }
    const user = await prisma.employee.findUnique({
      where: {
        employeeId: decoded.sub,
      },
    });
    if (!user) {
      res.sendStatus(401);
      return;
    }
    req.employee = user;
    next();
  } catch (err) {
    res.sendStatus(401);
    return;
  }
}

export default requireAuth;
