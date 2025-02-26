import { validationResult } from "express-validator";
import FoodItems from "../models/foodItems-model.js";
import { handleError } from "../utils/helpers.js";

const getFoodItems = async (req, res, next) => {
  try {
    const foodItems = await FoodItems.find();
    res.status(200).json({ foodItems });
  } catch (err) {
    handleError(err, next, "Could not find food items, please try again later");
  }
};

const getFoodItemById = async (req, res, next) => {
  try {
    const foodItem = await FoodItems.findById(req.params.fid);
    if (!foodItem) return handleError(null, next, "Food item not found", 404);
    res.status(200).json({ foodItem: foodItem.toObject({ getters: true }) });
  } catch (err) {
    handleError(err, next, "Could not retrieve the food item");
  }
};

const getFoodItemByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;

    const foodItems = await FoodItems.find({
      category: categoryName,
    });

    if (!foodItems || foodItems.length === 0) {
      return res
        .status(404)
        .json({ message: "No food items found for this category" });
    }

    res.status(200).json(foodItems);
  } catch (err) {
    handleError(
      err,
      next,
      "Could not retrieve the food items for the provided category"
    );
  }
};

const createFoodItem = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return handleError(
      null,
      next,
      "Invalid inputs passed, please check the data",
      422
    );
  }

  const newFoodItem = new FoodItems(req.body);
  try {
    await newFoodItem.save();
    res.status(201).json({ foodItem: newFoodItem });
  } catch (err) {
    handleError(err, next, "Creating food item failed, please try again");
  }
};

const updateFoodItemById = async (req, res, next) => {
  // if (!validationResult(req).isEmpty()) {
  //   return handleError(
  //     null,
  //     next,
  //     "Invalid inputs passed, please check the data",
  //     422
  //   );
  // }

  try {
    const foodItem = await FoodItems.findById(req.params.fid);
    if (!foodItem) return handleError(null, next, "Food item not found", 404);

    Object.assign(foodItem, req.body);

    await foodItem.save();
    res.status(200).json({ foodItem: foodItem.toObject({ getters: true }) });
  } catch (err) {
    handleError(err, next, "Could not update food item");
  }
};

const deleteFoodItemById = async (req, res, next) => {
  try {
    const foodItem = await FoodItems.findById(req.params.fid);
    if (!foodItem) return handleError(null, next, "Food item not found", 404);

    await foodItem.deleteOne();
    res.status(200).json({ message: "Deleted food item successfully" });
  } catch (err) {
    handleError(err, next, "Could not delete food item");
  }
};

export {
  getFoodItems,
  getFoodItemById,
  getFoodItemByCategory,
  createFoodItem,
  updateFoodItemById,
  deleteFoodItemById,
};
