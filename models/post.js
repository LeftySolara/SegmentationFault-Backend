const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema({
  author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  thread: { type: mongoose.Types.ObjectId, required: true, ref: "Thread" },
  dateCreated: { type: Date, required: true, immutable: true },
  content: { type: String, required: true },
});

module.exports = mongoose.model("Post", postSchema);
