const mongoose = require("mongoose");

const { Schema } = mongoose;

const threadSchema = Schema({
  author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  topic: { type: String, required: true },
  dateCreated: { type: Date, required: true, immutable: true },
  posts: [{ type: mongoose.Types.ObjectId, required: false, ref: "Post" }],
  lastPost: { type: mongoose.Types.ObjectId, required: false, ref: "Post" },
});

module.exports = mongoose.model(threadSchema, "Thread");
