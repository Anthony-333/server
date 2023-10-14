import express from "express";
import { getAllUsers } from "../Controllers/UserController.ts";
import requiredAuth from "../middleware/requiredAuth.ts";

const router = express.Router();

// Register Route
// router.use(requiredAuth);
router.get("/allUsers", getAllUsers);

export default router;
