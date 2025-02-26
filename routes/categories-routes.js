import express from "express";
import {
  deleteCategory,
  createCategory,
  getCategories,
  updateCategory,
} from "../controllers/categories-controllers.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", createCategory);
router.patch("/:cid", updateCategory);
router.delete("/:cid", deleteCategory);

export default router;
