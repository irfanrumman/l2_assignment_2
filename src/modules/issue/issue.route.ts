import { Router } from "express";
import { issueController } from "./issue.controller";
import authMiddelWare from "../../middelware/auth";

const router = Router();
const authParamiter = {
  contributor: "contributor",
  maintainer: "maintainer",
};
router.post(
  "/",
  authMiddelWare(authParamiter.contributor, authParamiter.maintainer),
  issueController.createIssue,
);
router.get("/", issueController.getALlIssues);
router.get("/:id", issueController.getSingleIssue);
router.patch(
  "/:id",
  authMiddelWare(authParamiter.contributor, authParamiter.maintainer),
  issueController.updateIssue,
);

export const issueRoute = router;
