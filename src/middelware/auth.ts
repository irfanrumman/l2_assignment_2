import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../configaration";
import { pool } from "../db";
import sendResponse from "../utils/sedResponse";
import type { UserRole } from "./auth.intrface";

const authMiddelWare = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access!!",
        });
        return;
      }

      //Decoded
      const decoded = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;

      const userData = await pool.query(
        `
        SELECT * FROM users WHERE email=$1
      `,
        [decoded.email],
      );

      const user = userData.rows[0];

      if (userData.rows.length === 0) {
        sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized!",
        });
        return;
      }

      if (!user.role) {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "User can not see issues!",
        });
      }

      if (!roles.includes(userData.rows[0].role)) {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden Access!",
        });
        return;
      }
      req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authMiddelWare;
