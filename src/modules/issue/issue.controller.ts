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

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueServiece.getSingleIssueFromDB(req.params);

    res.status(200).json({
      success: true,
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

const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const result = await issueServiece.updateIssueIntoDB(
      id as string,
      userId,
      userRole,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
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

const removeIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await issueServiece.deleteIssueFromDB(id as string);

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: true,
      message: error.message,
      error: error,
    });
  }
};

export const issueController = {
  createIssue,
  getALlIssues,
  getSingleIssue,
  updateIssue,
  removeIssue,
};
