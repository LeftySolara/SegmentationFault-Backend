const express = require("express");
const { check } = require("express-validator");

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
  (req, res, next) => {
    return res.json({ message: "Registering user..." });
  },
);

router.post("/login", (req, res, next) => {
  return res.json({ message: "Logging in..." });
});

module.exports = router;
