import { Schema, model } from "mongoose";

const foodItemsSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: String, required: true },
    discountedPrice: { type: Number, required: true },
    available: { type: Boolean, required: true, default: true },
    couponApplicable: { type: Boolean, default: false },
    tags: { type: [String], required: false },
    nutrition: {
      calories: { type: Number, required: false },
      protein: { type: Number, required: false },
      fat: { type: Number, required: false },
      carbs: { type: Number, required: false },
    },
  },
  { timestamps: true }
);

foodItemsSchema.pre("save", function (next) {
  if (this.price - this.discountedPrice > 50) {
    this.couponApplicable = false;
  } else {
    this.couponApplicable = true;
  }
  next();
});

export default model("FoodItems", foodItemsSchema);
