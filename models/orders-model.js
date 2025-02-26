import { Schema, model, Types } from "mongoose";

const itemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const ordersSchema = new Schema(
  {
    items: { type: [itemSchema], required: true },
    totalPrice: { type: Number, required: true },
    creator: { type: Types.ObjectId, required: true, ref: "Users" },
    address: { type: Types.ObjectId, required: true, ref: "Addresses" },
  },
  { timestamps: true }
);

export const Orders = model("Orders", ordersSchema);
