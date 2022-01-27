const mongoose = require("mongoose");

const validateRequestInputs = require("../utils/inputValidator");
const HttpError = require("../utils/http-error");
const logger = require("../utils/logger");

const Board = require("../models/board");
const BoardCategory = require("../models/boardCategory");

/**
 * Fetches all boards from the database.
 */
const getAllBoards = async (req, res, next) => {
  let boards;

  try {
    boards = await Board.find({});
  } catch (err) {
    logger.error("Failed to fetch boards for GET request at /boards.");
    const error = new HttpError("Fetching boards failed.", 500);
    return next(error);
  }

  return res.json({
    boards: boards.map((board) => board.toObject({ getters: true })),
  });
};

/**
 * Fetches a board based on its ID.
 */
const getBoardById = async (req, res, next) => {
  const { boardId } = req.params;

  let board;
  try {
    board = await Board.findById(boardId);
  } catch (err) {
    const error = new HttpError(
      `Could not find board with ID ${boardId}.`,
      404,
    );
    return next(error);
  }

  return res.status(200).json({ board: board.toObject({ getters: true }) });
};

/**
 * Creates a new board and saves it to the database.
 *
 * @param {String} req.body.topic The board topic. This will be used as the name of the board.
 *
 * @returns On success, returns a JSON-formatted HTTP response. On failure, returns an HttpError object.
 */
const createBoard = async (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }

  const { topic, description, categoryId } = req.body;

  /* Check whether the given category ID corresponds to an existing category. */
  let existingCategory;
  try {
    existingCategory = await BoardCategory.findById(categoryId);
  } catch (err) {
    const error = new HttpError("Creating board failed.", 500);
    return next(error);
  }
  if (!existingCategory) {
    const error = new HttpError(
      "Could not find category to assign board.",
      422,
    );
    return next(error);
  }

  /* Check whether board already exists. */
  let existingBoard;
  try {
    existingBoard = await Board.findOne({ topic });
  } catch (err) {
    const error = new HttpError("Board creation failed.", 422);
    return next(error);
  }
  if (existingBoard) {
    const error = new HttpError("Board exists.", 422);
    return next(error);
  }

  const createdBoard = new Board({
    topic,
    description,
    category: categoryId,
    threads: [],
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdBoard.save({ session: sess });
    const boardId = createdBoard.toObject({ getters: true }).id;

    existingCategory.boards.push(boardId);
    await existingCategory.save({ session: sess, validateModifiedOnly: true });

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Failed to create board. Please try again.",
      500,
    );
    return next(error);
  }

  logger.info(`Created new board ${topic}.`);
  return res.status(201).json({ message: `Created new board ${topic}.` });
};

/**
 * Updates a board's information.
 *
 * @param {String} req.body.topic The new topic for the board.
 * @param {String} req.body.categoryId The new category to assign the board to.
 *
 * @returns An HTTP response containing the board's updated information.
 */
const updateBoard = async (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }

  const { topic, description, categoryId } = req.body;
  const { boardId } = req.params;

  let board;
  try {
    board = await Board.findById(boardId).populate("category");
  } catch (err) {
    const error = new HttpError("Board not found.", 404);
    return next(error);
  }

  try {
    board.topic = topic;
    board.description = description;

    const sess = await mongoose.startSession();
    sess.startTransaction();

    if (categoryId && categoryId !== board.category) {
      /* Remove from source category and add to target category. */
      board.category.boards.pull(board);
      await board.category.save({ session: sess, validateModifiedOnly: true });

      const targetCategory = await BoardCategory.findById(categoryId);
      targetCategory.boards.push(boardId);
      await targetCategory.save({ session: sess, validateModifiedOnly: true });

      board.category = categoryId;
    }
    await board.save({ session: sess, validateModifiedOnly: true });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Failed to update board. Please try again.",
      500,
    );
    return next(error);
  }

  return res.status(200).json({ board: board.toObject({ getters: true }) });
};

/**
 * Deletes a board from the database. This also removes it
 * from the corresponding BoardCategory entry.
 *
 * @returns A JSON-formatted HTTP response.
 *
 */
const deleteBoard = async (req, res, next) => {
  const { boardId } = req.params;

  let board;
  try {
    board = await Board.findById(boardId).populate("category");
  } catch (err) {
    const error = new HttpError("Could not delete board.", 500);
    return next(error);
  }

  if (!board) {
    const error = new HttpError("Could not find board.", 404);
    return next(error);
  }

  /* TODO: Also delete the board's threads. */

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    /* Remove the board from its category. */
    board.category.boards.pull(board);
    await board.category.save({ session: sess, validateModifiedOnly: true });

    await Board.findByIdAndDelete(boardId);
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Unable to delete board.", 500);
    return next(error);
  }

  return res.status(200).json({ message: "Successfully deleted board." });
};

exports.getAllBoards = getAllBoards;
exports.getBoardById = getBoardById;
exports.createBoard = createBoard;
exports.updateBoard = updateBoard;
exports.deleteBoard = deleteBoard;
