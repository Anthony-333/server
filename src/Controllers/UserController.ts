import UserModel from "../models/UserModel.ts";
import { Request, Response } from "express";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find({});
    
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
