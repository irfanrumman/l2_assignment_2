import { Router } from "express";
import { IssueController } from "./issue.controller";
import authUser from "../../middelware/auth";

const router = Router();

router.post("/", authUser(), IssueController.createIssue);

export const issueRoute = router;
