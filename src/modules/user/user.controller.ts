import type { NextFunction, Request, Response } from "express";
import { authService } from "./user.serviece";
import sendResponse from "../../utils/sedResponse";

const signupUser = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const result = await authService.signupUserToDB(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
  next(error)
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, user } = await authService.loginUserFromDB(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: { token, user },
    });
  } catch (error) {
   next(error)
  }
};

export const authController = {
  signupUser,
  loginUser,
};
