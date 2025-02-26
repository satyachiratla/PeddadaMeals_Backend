import express from "express";
import {
  createFoodItem,
  deleteFoodItemById,
  getFoodItemByCategory,
  getFoodItemById,
  getFoodItems,
  updateFoodItemById,
} from "../controllers/foodItems-controllers.js";
import { check } from "express-validator";

const router = express.Router();

router.get("/", getFoodItems);
router.get("/:fid", getFoodItemById);
router.get("/category/:categoryName", getFoodItemByCategory);
router.post(
  "/",
  [
    check("name").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("price").not().isEmpty(),
    check("image").isURL(),
    check("type").not().isEmpty(),
    check("category").not().isEmpty(),
    check("discountedPrice").not().isEmpty(),
    check("available").not().isEmpty(),
  ],
  createFoodItem
);
router.patch(
  "/:fid",
  // [
  //   check("name").not().isEmpty(),
  //   check("description").isLength({ min: 5 }),
  //   check("price").not().isEmpty(),
  //   check("image").isURL(),
  // ],
  updateFoodItemById
);
router.delete("/:fid", deleteFoodItemById);

export default router;
