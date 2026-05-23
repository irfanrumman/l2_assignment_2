import type { Request, Response } from "express";
import { authService } from "./user.serviece";

const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.signupUserToDB(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { token, user, refreshToken } = await authService.loginUserFromDB(
      req.body,
    );

    res.cookie("refreshToken", refreshToken, {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    });


    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, user },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  signupUser,
  loginUser,
};
