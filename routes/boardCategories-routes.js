const express = require("express");
const { check } = require("express-validator");

const boardCategoriesController = require("../controllers/boardCategories-controller");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", boardCategoriesController.getAllCategories);

router.get("/:boardCategoryId", boardCategoriesController.getCategoryById);

router.use(checkAuth);

router.post(
  "/",
  [check("topic").not().isEmpty()],
  [check("sortOrder").isNumeric()],
  boardCategoriesController.createCategory,
);

router.patch(
  "/:boardCategoryId",
  [check("topic").not().isEmpty()],
  [check("sortOrder").isNumeric()],
  boardCategoriesController.updateCategory,
);

router.delete("/:boardCategoryId", boardCategoriesController.deleteCategory);

module.exports = router;
