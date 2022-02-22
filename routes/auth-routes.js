const express = require("express");
const { check } = require("express-validator");

const authController = require("../controllers/auth-controller");

const router = express.Router();

router.get("/checkIsAuthenticated", authController.checkIsAuthenticated);

router.get("/checkIsAdmin", authController.checkIsAdmin);

router.get("/logout", authController.logout);

router.post(
  "/register",
  [
    check("username").not().isEmpty().isAlphanumeric(),
    check("email").isEmail(),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Your password must be at least 8 characters.")
      .matches(/\d/)
      .withMessage("Your password should contain at least one number.")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage(
        "Your password must contain at least one special character.",
      ),
    check("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Confirm password does not match.");
      }
      return true;
    }),
  ],
  authController.registerUser,
);

router.post(
  "/login",
  check("email").isEmail(),
  check("password").not().isEmpty(),
  authController.login,
);

module.exports = router;
