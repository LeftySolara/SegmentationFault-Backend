const express = require("express");
const { check } = require("express-validator");

const boardCategoriesController = require("../controllers/boardCategories-controller");

const router = express.Router();

router.get("/", boardCategoriesController.getAllCategories);

router.get("/:boardCategoryId", boardCategoriesController.getCategoryById);

router.post(
  "/",
  [check("topic").not().isEmpty()],
  boardCategoriesController.createCategory,
);

router.patch(
  "/:boardCategoryId",
  [check("topic").not().isEmpty()],
  boardCategoriesController.updateCategory,
);

router.delete("/:boardCategoryId", boardCategoriesController.deleteCategory);

module.exports = router;
