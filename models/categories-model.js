import { Schema, model } from "mongoose";

const categoriesSchema = new Schema({
  name: { type: String, required: true, unique: true },
  banner: { type: String },
  image: {
    type: String,
    required: true,
    // validate: {
    //   validator: function (v) {
    //     return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(v);
    //   },
    //   message: (props) => `${props.value} is not a valid image URL!`,
    // },
  },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
});

export const Categories = model("Categories", categoriesSchema);
