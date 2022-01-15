const mongoose = require("mongoose");

const validateRequestInputs = require("../utils/inputValidator");
const HttpError = require("../utils/http-error");

const Post = require("../models/post");
const Thread = require("../models/thread");
const User = require("../models/user");

const getAllPosts = (req, res, next) => {
  return res.json({ message: "Fetching all posts..." });
};

const getPostById = (req, res, next) => {
  const id = req.params.postId;
  return res.json({ message: `Fetching post ${id}...` });
};

const getPostsByUser = (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Fetching posts by user ${id}` });
};

/**
 * Creates a new post in the database.
 *
 * @param {String} req.body.authorId The ID of the post's author.
 * @param {String} req.body.threadId The ID of the thread the post will be attached to.
 * @param {String} req.body.content The text content of the post.
 *
 * @returns On success, returns HTTP status code 201. Otherwise, passes the relavent error to the next middleware function.
 */
const createPost = async (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }

  const { authorId, threadId, content } = req.body;

  /* Check whether the thread exists. */
  let existingThread;
  try {
    existingThread = await Thread.findById(threadId);
  } catch (err) {
    const error = new HttpError("Creating post failed.", 500);
    return next(error);
  }
  if (!existingThread) {
    const error = new HttpError("Could not find thread to assign post.", 404);
    return next(error);
  }

  /* Check whether the author exists. */
  let existingUser;
  try {
    existingUser = await User.findById(authorId);
  } catch (err) {
    const error = new HttpError("Creating post failed.", 500);
    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError("Could not find user to assign post.", 404);
    return next(error);
  }

  const createdPost = new Post({
    author: authorId,
    thread: threadId,
    dateCreated: Date.now(),
    content,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdPost.save({ session: sess });
    const postId = createdPost.toObject({ getters: true }).id;

    /* Add post to author's list of posts. */
    existingUser.posts.push(postId);
    await existingUser.save({ session: sess, validateModifiedOnly: true });

    /* Add post to thread. */
    existingThread.posts.push(postId);
    await existingThread.save({ session: sess, validateModifiedOnly: true });

    sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Failed to create thread. Please try again.",
      500,
    );
    return next(error);
  }

  return res.status(201).json({ message: "Created new post." });
};

const updatePost = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  const id = req.params.postId;
  return res.json({ message: `Updating post ${id}...` });
};

const deletePost = (req, res, next) => {
  const id = req.params.postId;
  return res.json({ message: `Deleting post ${id}...` });
};

exports.getAllPosts = getAllPosts;
exports.getPostById = getPostById;
exports.getPostsByUser = getPostsByUser;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
