const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");

const logger = require("../utils/logger");

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
  password: { type: String, required: true, minlength: 8 },
  joinDate: { type: Date, required: true },
  avatar: { type: String, required: false },
  posts: [{ type: mongoose.Types.ObjectId, required: true, ref: "Post" }],
  threads: [{ type: mongoose.Types.ObjectId, required: true, ref: "Thread" }],
});

/**
 * Hash the user's password before saving to the database.
 */
userSchema.pre("save", async function (next) {
  const user = this;

  try {
    if (!user.isModified("password")) {
      next();
    }
    const hash = await bcrypt.hash(user.password, 13);
    user.password = hash;
    next();
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

userSchema.methods.comparePassword = async function (password) {
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (err) {
    return false;
  }
};

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
