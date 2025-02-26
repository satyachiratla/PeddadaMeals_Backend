import { Schema, model, Types } from "mongoose";

const addressSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: [2, "Name must be at least 2 characters long."],
    maxlength: [50, "Name must be at most 50 characters long."],
    // match: [/^[a-zA-Z\s]+$/, "Name should contain only alphabetic characters."],
  },
  address: {
    type: String,
    required: true,
    minlength: [10, "Address must be at least 10 characters long."],
    maxlength: [200, "Address must be at most 100 characters long."],
  },
  landmark: {
    type: String,
    maxlength: [100, "Landmark must be at most 50 characters long."],
  },
  pincode: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{6}$/.test(v.toString());
      },
      message: "Pincode must be exactly 6 digits.",
    },
  },
  type: { type: String, enum: ["Home", "Work", "Other"], required: true },
  creator: { type: Types.ObjectId, required: true, ref: "Users" },
});

export const Addresses = model("Addresses", addressSchema);
