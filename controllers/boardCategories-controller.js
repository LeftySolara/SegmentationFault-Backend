const validateRequestInputs = require("../utils/inputValidator");
const HttpError = require("../utils/http-error");
const logger = require("../utils/logger");

const BoardCategory = require("../models/boardCategory");

/**
 * Fetches all board categories from the database.
 */
const getAllCategories = async (req, res, next) => {
  let boardCategories;

  try {
    boardCategories = await BoardCategory.find({});
  } catch (err) {
    logger.error(
      "Failed to fetch board categories for GET request at /boardCategories",
    );
    const error = new HttpError("Fetching board categories failed.", 500);
    return next(error);
  }

  return res
    .status(200)
    .json(
      boardCategories.map((category) => category.toObject({ getters: true })),
    );
};

/**
 * Fetches a board category based on its ID.
 */
const getCategoryById = async (req, res, next) => {
  const { boardCategoryId } = req.params;

  let boardCategory;
  try {
    boardCategory = await BoardCategory.findById(boardCategoryId);
  } catch (err) {
    const error = new HttpError(
      `Could not find board category with id ${boardCategoryId}.`,
    );
    return next(error);
  }

  return res
    .status(200)
    .json({ boardCategory: boardCategory.toObject({ getters: true }) });
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

/**
 * Updates a board category's information.
 *
 * @param {String} req.body.topic The new topic to assign to the category.
 *
 * @returns On success, returns a JSON-formatted HTTP response. On failure, returns an HttpError object.
 */
const updateCategory = async (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }

  const { topic } = req.body;
  const { boardCategoryId } = req.params;
  let boardCategory;

  try {
    boardCategory = await BoardCategory.findById(boardCategoryId);
  } catch (err) {
    const error = new HttpError("Board category not found.", 404);
    return next(error);
  }

  boardCategory.topic = topic;
  try {
    await boardCategory.save();
  } catch (err) {
    const error = new HttpError("Could not update board category.", 500);
    return next(error);
  }

  return res
    .status(200)
    .json({ boardCategory: boardCategory.toObject({ getters: true }) });
};

/**
 * Deletes a board category from the database.
 */
const deleteCategory = async (req, res, next) => {
  const { boardCategoryId } = req.params;

  let boardCategory;
  try {
    boardCategory = await BoardCategory.findById(boardCategoryId);
  } catch (err) {
    const error = new HttpError("Could not delete board category.", 500);
    return next(error);
  }

  if (!boardCategory) {
    const error = new HttpError(
      "Could not find a board category for this ID.",
      404,
    );
    return next(error);
  }

  /* TODO: Also delete any boards that belong to the category.
   *       Those boards should, in turn, delete their threads,
   *       and those threads would delete their posts.
   */
  try {
    await BoardCategory.findByIdAndDelete(boardCategoryId);
  } catch (err) {
    const error = new HttpError("Unable to delete board category.", 500);
    return next(error);
  }

  return res
    .status(200)
    .json({ message: "Successfully deleted board category." });
};

exports.getAllCategories = getAllCategories;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
