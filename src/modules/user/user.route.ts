import { Router } from "express";
import { authController } from "./user.controller";

const router = Router();

router.post("/signup", authController.signupUser);

export const authRoute = router;
