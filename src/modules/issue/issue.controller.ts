import type { Request, Response } from "express";
import { issueServiece } from "./issue.serviece";
import type { IIssueQueryOptions } from "./issue.interface";
import sendResponse from "../../utils/sedResponse";

const createIssue = async (req: Request, res: Response) => {
  try {
    const reporter_id = req.user?.id;

    const result = await issueServiece.createIssueToDB({
      ...req.body,
      reporter_id,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
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

const getALlIssues = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query;
    const result = await issueServiece.getAllIssuesFromDB({
      sort,
      type,
      status,
    } as IIssueQueryOptions);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result || [],
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

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueServiece.getSingleIssueFromDB(req.params);

    sendResponse(res, {
      statusCode: 200,
      success: true,
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

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
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

const removeIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await issueServiece.deleteIssueFromDB(id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
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

export const issueController = {
  createIssue,
  getALlIssues,
  getSingleIssue,
  updateIssue,
  removeIssue,
};
