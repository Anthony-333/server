//import required modules
import express from "express";
import {
  loginUser,
  registerUser,
  verifyEmail,
  verifylogin,
} from "../Controllers/AuthController.js";

const router = express.Router();

//register Route
router.post("/register", registerUser);
//login Route
router.post("/login", loginUser);
//verify email route
router.get("/:id/verify-email/:token", verifyEmail);

//verify login
router.post("/verify-login", verifylogin);

export default router;
