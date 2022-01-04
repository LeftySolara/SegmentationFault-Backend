const validateRequestInputs = require("../utils/inputValidator");
const HttpError = require("../utils/http-error");
const logger = require("../utils/logger");

const BoardCategory = require("../models/boardCategory");

const getAllCategories = (req, res, next) => {
  return res.json({ message: "Fetching all board categories..." });
};

const getCategoryById = (req, res, next) => {
  const id = req.params.boardCategoryId;
  return res.json({ message: `Fetching board category ${id}...` });
};

/**
 * Creates a new board category.
 *
 * @param {String} req.body.topic The category topic. This will be the name of the category.
 *
 * @returns On success, returns a JSON-formatted HTTP response. On failure, returns an HttpError object.
 */
const createCategory = async (req, res, next) => {
  const validationErrpr = validateRequestInputs(req);
  if (validationErrpr) {
    return next(validationErrpr);
  }

  const { topic } = req.body;

  let existingBoardCategory;
  try {
    existingBoardCategory = await BoardCategory.findOne({ topic });
  } catch (err) {
    const error = new HttpError("Category creation failed.", 500);
    return next(error);
  }

  if (existingBoardCategory) {
    const error = new HttpError("Category exists.", 422);
    return next(error);
  }

  const createdBoardCategory = new BoardCategory({
    topic,
    boards: [],
  });

  try {
    await createdBoardCategory.save();
  } catch (err) {
    const error = new HttpError(
      "Failed to create category. Please try again.",
      500,
    );
    return next(error);
  }

  logger.info(`Created new board category ${topic}.`);
  return res.status(201).json({ message: `Created new category ${topic}.` });
};

const updateCategory = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  const id = req.params.boardCategoryId;
  return res.json({ message: `Updating board category ${id}...` });
};

const deleteCategory = (req, res, next) => {
  const id = req.params.boardCategoryId;
  return res.json({ message: `Deleting board category ${id}...` });
};

exports.getAllCategories = getAllCategories;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
