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

  const { topic, categoryId } = req.body;

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

const updateBoard = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  const id = req.params.boardId;
  return res.json({ message: `Updating board ${id}...` });
};

const deleteBoard = (req, res, next) => {
  const id = req.params.boardId;
  return res.json(`Deleting board ${id}...`);
};

exports.getAllBoards = getAllBoards;
exports.getBoardById = getBoardById;
exports.createBoard = createBoard;
exports.updateBoard = updateBoard;
exports.deleteBoard = deleteBoard;
