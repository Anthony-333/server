//import required modules
import express from "express";
import { loginUser, registerUser } from "../Controllers/AuthController.js";

const router = express.Router();

//register Route
router.post("/register", registerUser);
//login Route
router.post("/login", loginUser);

export default router;