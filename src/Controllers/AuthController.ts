import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/UserModel.ts";
import { SendOtpVerificationEmail } from "../Util/Utils.ts";
// import { io } from "../index.ts";

const createToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&!])[A-Za-z\d@#$%^&!]{8,}$/;

export const registerUser = async (req: Request, res: Response) => {
  const { email, username, firstname, lastname, password, confirmpassword } =
    req.body;

  // Create an object with trimmed variables
  const Email = email.trim().toLowerCase();
  const Username = username.trim().toLowerCase();
  const Firstname = firstname.trim().toLowerCase();
  const Lastname = lastname.trim().toLowerCase();
  const Password = password.trim();
  const Confirmpassword = confirmpassword.trim();

  //checking

  if (!Email || !Username || !Firstname || !Lastname || !Password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!emailRegex.test(Email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (Confirmpassword !== Password) {
    return res
      .status(400)
      .json({ message: "Password does not match. Please try again." });
  }

  if (!passwordRegex.test(Password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
    });
  }

  //check if the username exists.
  const UserNameCheck = await UserModel.findOne({ username: Username });
  const EmailCheck = await UserModel.findOne({ email: Email });

  if (UserNameCheck) {
    return res.status(400).json({
      message: "Username already taken. Please try different.",
    });
  }

  if (EmailCheck) {
    return res.status(400).json({
      message: "Email already exist. Please try different.",
    });
  }

  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(Password, salt);

  const newUser = new UserModel({
    email: Email,
    username: Username,
    firstname: Firstname,
    lastname: Lastname,
    password: hashedPass,
  });

  try {
    const user = await newUser.save();
    const token = createToken(user._id);

    return res.status(200).json({ message: "Successfuly signed up", user });
    // return res.cookie("token", token, { httpOnly: true }).send();

    // io.emit('new user', allusers);

    // return res.status(200).cookie("token", token, { httpOnly: true });
    // return res.cookie("token", token, { httpOnly: true }).send();
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    let user = await UserModel.findOne({ username: username });

    // If user is not found by username, try finding by email
    if (!user) {
      user = await UserModel.findOne({ email: username });
    }

    if (user) {
      const validity = await bcrypt.compare(password, user.password);

      if (!validity) {
        return res.status(400).json({
          message: "Wrong password. Please try again.",
        });
      } else {
        const token = createToken(user._id);
        return res.status(200).json({ user, token });
      }
    } else {
      return res.status(400).json({
        message: "Email or username does not exists.",
      });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
};
