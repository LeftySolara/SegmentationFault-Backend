const express = require("express");
const { check } = require("express-validator");

const authController = require("../controllers/auth-controller");

const router = express.Router();

router.get("/checkIsAuthenticated", authController.checkIsAuthenticated);

router.get("/checkIsAdmin", authController.checkIsAdmin);

router.get("/logout", authController.logout);

router.post(
  "/login",
  check("email").isEmail(),
  check("password").not().isEmpty(),
  authController.login,
);

module.exports = router;
