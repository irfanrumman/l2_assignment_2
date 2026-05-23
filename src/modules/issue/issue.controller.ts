import type { Request, Response } from "express";
import { issueServiece } from "./issue.serviece";

const createIssue = async (req: Request, res: Response) => {
  try {
    const reporter_id = req.user?.id;

    const result = await issueServiece.createIssueToDB({
      ...req.body,
      reporter_id,
    });

   
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
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

export const IssueController = {
  createIssue,
};
