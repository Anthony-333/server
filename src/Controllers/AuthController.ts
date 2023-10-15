import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/UserModel.ts";
import { SendVerificationEmail } from "../Util/Utils.ts";
import TokenModel from "../models/TokenModel.ts";
import crypto from "crypto";
// import { io } from "../index.ts";

const createToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
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
    // const token = createToken(user._id);

    if (user) {
      const Token = new TokenModel({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      });

      const userToken = await Token.save();

      const url = `${process.env.CLIENT_ENDPOINT}/auth/${user._id}/verify-email/${userToken.token}`;

      await SendVerificationEmail({
        email: user.email,
        subject: "Email Verification - The Forum",
        text: url,
      });
    }

    return res.status(200).json({
      message: "Signed up Success! We've sent a verification on your inbox.",
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }
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
        return res
          .status(200)
          .json({ message: "Signed in successfully.", user, token });
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

export const verifyEmail = async (req: Request, res: Response) => {
  const { _id, _token } = req.body;
  try {
    const user = await UserModel.findOne({ _id: _id });

    if (!user)
      return res.status(400).json({
        message: "Invalid link Please request new.",
      });

    const token = await TokenModel.findOne({
      userId: user._id,
      token: _token,
    });

    if (!token)
      return res.status(400).json({
        message: "Invalid link Please request new.",
      });

    await UserModel.updateOne({ _id: user._id, emailVerified: true });
    await TokenModel.findOneAndRemove();

    return res.status(200).json({
      message: "Email verified successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
};

export const verifylogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      message: "There's no token provided",
    });
  }

  try {
    await jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    return res.status(401).json({ message: "Token is expired" });
  }
};
