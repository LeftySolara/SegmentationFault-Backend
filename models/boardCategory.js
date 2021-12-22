const mongoose = require("mongoose");

const { Schema } = mongoose;

const boardCategorySchema = new Schema({
  topic: { type: "String", required: true },
  boards: { type: mongoose.Types.ObjectId, required: false, ref: "Board" },
});

module.exports = mongoose.model(boardCategorySchema, "BoardCategory");
