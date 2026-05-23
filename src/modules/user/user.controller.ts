import type { Request, Response } from "express";
import { authService } from "./user.serviece";
import sendResponse from "../../utils/sedResponse";

const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.signupUserToDB(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error: error,
      });
    }
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { token, user } = await authService.loginUserFromDB(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: { token, user },
    });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error: error,
      });
    }
  }
};

export const authController = {
  signupUser,
  loginUser,
};
