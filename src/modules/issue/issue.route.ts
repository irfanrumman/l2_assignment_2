import { Router } from "express";
import { issueController } from "./issue.controller";
import authUser from "../../middelware/auth";

const router = Router();

router.post("/", authUser(), issueController.createIssue);
router.get("/", issueController.getALlIssues);
router.get("/:id", issueController.getSingleIssue);

export const issueRoute = router;
