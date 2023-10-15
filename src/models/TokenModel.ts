import mongoose, { Schema, Document } from "mongoose";

interface IToken extends Document {
  userId: string;
  token: string;
  expiration: string;
}

const TokenSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiration: {
      type: Date,
      default: Date.now(),
      expires: 3600,
    },
  },
  { timestamps: true }
);

const TokenModel = mongoose.model<IToken>("emailtoken", TokenSchema);

export default TokenModel;
