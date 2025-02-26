import { Schema, model, Types } from "mongoose";

const refreshTokenSchema = new Schema({
  token: { type: String, required: true },
  userId: { type: Types.ObjectId, ref: "Users", required: true },
  expiresAt: { type: Date, required: true },
});

export const RefreshToken = model("RefreshToken", refreshTokenSchema);
