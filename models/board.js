const mongoose = require("mongoose");

const { Schema } = mongoose;

const boardSchema = new Schema({
  topic: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "BoardCategory",
  },
  threads: [
    {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: "Thread",
    },
  ],
});

module.exports = mongoose.model("Board", boardSchema);
