import { Router } from "express";
import { authController } from "./user.controller";

const router = Router();

router.post("/signup", authController.signupUser);
router.post("/login", authController.loginUser);

export const authRoute = router;
