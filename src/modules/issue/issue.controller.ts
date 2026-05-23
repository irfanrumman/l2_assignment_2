import type { Request, Response } from "express";
import { issueServiece } from "./issue.serviece";
import type { IIssueQueryOptions } from "./issue.interface";

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
interface IReq {
  sort?: string;
  type?: string;
  status?: string;
}
const getALlIssues = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query;
    const result = await issueServiece.getAllIssuesFromDB({
      sort,
      type,
      status,
    } as IIssueQueryOptions);

    res.status(200).json({
      success: true,
      data: result || [],
    });
  } catch (error) {}
};

export const issueController = {
  createIssue,
  getALlIssues,
};
