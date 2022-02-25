const jwt = require("jsonwebtoken");

const HttpError = require("../utils/http-error");

const checkAuth = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: "Bearer TOKEN"
    if (!token) {
      return res.status(401).json({ message: "You are not logged in." });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed", 401);
    return next(error);
  }
};

module.exports = checkAuth;
