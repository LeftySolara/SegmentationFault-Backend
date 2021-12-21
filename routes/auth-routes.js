const express = require("express");

const router = express.Router();

router.get("/checkIsAuthenticated", (req, res, next) => {
  return res.json({ message: "Checking if user is authenticated..." });
});

router.get("/checkIsAdmin", (req, res, next) => {
  return res.json({ message: "Checking if user is admin..." });
});

router.get("/logout", (req, res, next) => {
  return res.json({ message: "Logging out..." });
});

router.post("/login", (req, res, next) => {
  return res.json({ message: "Logging in..." });
});

module.exports = router;
