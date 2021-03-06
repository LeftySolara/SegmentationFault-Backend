const dotenv = require("dotenv");

/* Load environment variables. */
if (process.env.NODE_ENV !== "production") {
  const configOutput = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
  if (configOutput.error) {
    throw configOutput.error;
  }
}

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const logger = require("./utils/logger");

const authRoutes = require("./routes/auth-routes");
const boardCategoriesRoutes = require("./routes/boardCategories-routes");
const boardsRoutes = require("./routes/boards-routes");
const postRoutes = require("./routes/posts-routes");
const threadsRoutes = require("./routes/threads-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json());

// add CORS headers to all responses
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/auth", authRoutes);
app.use("/boardCategories", boardCategoriesRoutes);
app.use("/boards", boardsRoutes);
app.use("/posts", postRoutes);
app.use("/threads", threadsRoutes);
app.use("/users", usersRoutes);

/*
 * Default error handling function.
 * Express will execute for any middleware that has an error.
 */
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  return res.json({ message: error.message || "An unknown error occurred." });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info(`Connected to ${process.env.NODE_ENV} database.`);
    logger.info(`Listening on port ${process.env.PORT}.`);
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => logger.error(err.message));
