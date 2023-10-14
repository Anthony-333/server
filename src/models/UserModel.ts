import mongoose, { Schema, Document } from "mongoose";

export enum userRole {
  PreEnrolled = "PreEnrolled",
  InActive = "InActive",
  Active = "Active",
}

interface IUser extends Document {
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  password?: string;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      // unique:true
    },
    username: {
      type: String,
      required: true,
      // unique:true
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(userRole),
      default: userRole.PreEnrolled,
    },
    password: {
      type: String,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<IUser>("users", UserSchema);

export default UserModel;
