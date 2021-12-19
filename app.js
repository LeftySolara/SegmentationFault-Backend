const dotenv = require("dotenv");

/* Load environment variables. */
const configOutput = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
if (configOutput.error) {
  throw configOutput.error;
}

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.json({ message: "Hello World!" });
});

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

app.listen(process.env.PORT);
