import { Router } from "express";
import { issueController } from "./issue.controller";
import authUser from "../../middelware/auth";

const router = Router();

router.post("/", authUser(), issueController.createIssue);
router.get("/", issueController.getALlIssues);

export const issueRoute = router;
