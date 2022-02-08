const mongoose = require("mongoose");

const { Schema } = mongoose;

const boardCategorySchema = new Schema({
  topic: { type: "String", required: true },
  boards: [{ type: mongoose.Types.ObjectId, required: false, ref: "Board" }],
  sortOrder: { type: "Number", required: true, min: 0 },
});

module.exports = mongoose.model("BoardCategory", boardCategorySchema);
