import { Schema, model, Types } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const usersSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  profilePic: { type: String, default: "" },
  mobileNumber: { type: Number, default: null },
  gender: { type: String, default: "" },
  dob: { type: String, default: "" },
  orders: [{ type: Types.ObjectId, required: true, ref: "Orders" }],
  addresses: [{ type: Types.ObjectId, required: true, ref: "Addresses" }],
});

usersSchema.plugin(uniqueValidator);

export const Users = model("Users", usersSchema);
