import { Categories } from "../models/categories-model.js";
import { handleError } from "../utils/helpers.js";

const getCategories = async (req, res, next) => {
  try {
    const categories = await Categories.find();
    res.status(200).json({ categories });
  } catch (err) {
    handleError(err, next, "Could not find categories, please try again later");
  }
};

const createCategory = async (req, res, next) => {
  const newCategory = new Categories(req.body);
  try {
    await newCategory.save();
    res.status(201).json({ category: newCategory });
  } catch (err) {
    handleError(err, next, "Creating category failed, please try again");
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Categories.findById(req.params.cid);
    if (!category) return handleError(null, next, "Category not found", 404);

    Object.assign(category, req.body);

    await category.save();
    res.status(200).json({ category: category.toObject({ getters: true }) });
  } catch (err) {
    handleError(err, next, "Could not update category");
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Categories.findById(req.params.cid);
    if (!category) return handleError(null, next, "Category not found", 404);

    await category.deleteOne();
    res.status(200).json({ message: "Deleted category successfully" });
  } catch (err) {
    handleError(err, next, "Could not delete category");
  }
};

export { getCategories, createCategory, updateCategory, deleteCategory };
