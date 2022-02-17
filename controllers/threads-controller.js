const mongoose = require("mongoose");

const validateRequestInputs = require("../utils/inputValidator");
const HttpError = require("../utils/http-error");
const logger = require("../utils/logger");

const Thread = require("../models/thread");
const Board = require("../models/board");
const User = require("../models/user");
const Post = require("../models/post");

/**
 * Fetches all threads in the database.
 */
const getAllThreads = async (req, res, next) => {
  let threads;

  try {
    threads = await Thread.find({});
  } catch (err) {
    logger.error("Failed to fetch threads for GET request at /threads.");
    const error = new HttpError("Fetching threads failed.", 500);
    return next(error);
  }

  return res.status(200).json({
    threads: threads.map((thread) => thread.toObject({ getters: true })),
  });
};

/**
 * Fetches a thread based on its ID.
 */
const getThreadById = async (req, res, next) => {
  const { threadId } = req.params;

  let thread;
  try {
    thread = await Thread.findById(threadId);
  } catch (err) {
    const error = new HttpError(
      `Could not find thread with ID ${threadId}.`,
      404,
    );
    return next(error);
  }

  return res.status(200).json({ thread: thread.toObject({ getters: true }) });
};

/**
 * Fetches a list of all threads created by a specific user.
 *
 * @param {String} req.params.authorId The ID of the user to find threads for.
 */
const getThreadsByUser = async (req, res, next) => {
  const { authorId } = req.params;

  let threads;
  try {
    threads = await Thread.find({ author: authorId });
  } catch (err) {
    const error = new HttpError("Error fetching threads from user.", 500);
    return next(error);
  }

  return res.status(200).json({
    threads: threads.map((thread) => thread.toObject({ getters: true })),
  });
};

/**
 * Fetches a list of threads that belong to a specific board.
 *
 * @param {String} req.params.boardId The ID of the board to fetch threads from.
 * @param {Number} req.query.limit The maximum number of posts to fetch. The default is 20.
 *
 * @returns On success, returns a list of Thread objects.
 */
const getThreadsByBoard = async (req, res, next) => {
  const { boardId } = req.params;
  let { limit } = req.query;

  if (!limit || limit < 0) {
    limit = 20;
  }

  /* Here we're sorting the threads by dateCreated since lastPost isn't implemented yet. */
  /* TODO: sort threads by last post instead of date created */
  let threads;
  try {
    threads = await Thread.find({ board: boardId })
      .sort({ dateCreated: "desc" })
      .limit(parseInt(limit, 10));
  } catch (err) {
    const error = new HttpError("Error fetching threads from board.", 500);
    return next(error);
  }

  return res.status(200).json({
    threads: threads.map((thread) => thread.toObject({ getters: true })),
  });
};

/**
 * Creates a new thread and saves it to the database.
 *
 * @param {String} req.body.topic The thread topic. This will be used as the name of the thread.
 *
 * @returns On success, returns a JSON-formatted HTTP response. On failure, returns an HttpError object.
 */
const createThread = async (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }

  const { authorId, boardId, topic } = req.body;

  /* Check whether the board exists. */
  let existingBoard;
  try {
    existingBoard = await Board.findById(boardId);
  } catch (err) {
    const error = new HttpError("Creating thread failed.");
    return next(error);
  }
  if (!existingBoard) {
    const error = new HttpError("Could not find board to assign thread.", 422);
    return next(error);
  }

  /* Check whether the author exists. */
  let existingUser;
  try {
    existingUser = await User.findById(authorId);
  } catch (err) {
    const error = new HttpError("Creating thread failed.");
    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError("Could not find user to assign thread.", 422);
    return next(error);
  }

  const createdThread = new Thread({
    author: authorId,
    board: boardId,
    topic,
    dateCreated: Date.now(),
    posts: [],
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdThread.save({ session: sess });
    const threadId = createdThread.toObject({ getters: true }).id;

    existingBoard.threads.push(threadId);
    await existingBoard.save({ session: sess, validateModifiedOnly: true });

    existingUser.threads.push(threadId);
    await existingUser.save({ session: sess, validateModifiedOnly: true });

    sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Failed to create thread. Please try again.",
      500,
    );
    return next(error);
  }

  return res
    .status(201)
    .json({ thread: createdThread.toObject({ getters: true }) });
};

/**
 *
 * @param {String} req.params.threadId The ID of the thread to update.
 * @param {String} res.body.topic The new topic for the thread.
 *
 * @returns On success, returns an HTTP status code of 200, along with the updated thread.
 */
const updateThread = async (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }

  const { threadId } = req.params;
  const { topic } = req.body;

  let thread;
  try {
    thread = await Thread.findById(threadId);
  } catch (err) {
    const error = new HttpError("Thread not found.", 404);
    return next(error);
  }

  try {
    thread.topic = topic;
    await thread.save();
  } catch (err) {
    const error = new HttpError("Error updating thread.", 500);
    return next(error);
  }

  return res.status(200).json({ thread: thread.toObject({ getters: true }) });
};

/**
 * Deletes a thread from the database.
 *
 * @param {String} req.params.threadId The ID of the thread to delete.
 *
 * @returns On success, returns an HTTP response of 200.
 */
const deleteThread = async (req, res, next) => {
  const { threadId } = req.params;

  let thread;
  try {
    thread = await Thread.findById(threadId)
      .populate("author")
      .populate("board")
      .populate("posts");
  } catch (err) {
    const error = new HttpError("Error deleting thread.", 500);
    return next(error);
  }

  if (!thread) {
    const error = new HttpError("Could not find thread to delete.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    /* Remove the thread from its board. */
    thread.board.threads.pull(thread);
    await thread.board.save({ session: sess, validateModifiedOnly: true });

    /* Remove the thread from the author. */
    thread.author.threads.pull(thread);
    await thread.author.save({ session: sess, validateModifiedOnly: true });

    /* Delete all of the thread's posts. */
    thread.posts.forEach(async (post) => {
      post.author.posts.pull(post);
      await post.remove();
    });

    await Thread.findByIdAndDelete(threadId);

    sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Unable to delete thread.", 500);
    return next(error);
  }

  return res.status(200).json({ message: "Successfully deleted thread." });
};

exports.getAllThreads = getAllThreads;
exports.getThreadById = getThreadById;
exports.getThreadsByUser = getThreadsByUser;
exports.getThreadsByBoard = getThreadsByBoard;
exports.createThread = createThread;
exports.updateThread = updateThread;
exports.deleteThread = deleteThread;
