const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.json({ message: "Fetching all users..." });
});

router.get("/:userId", (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Fetching user ${id}...` });
});

router.post(
  "/",
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
    return res.json({ message: "Creating user..." });
  },
);

router.patch(
  "/:userId",
  [
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
    return res.json({ message: "Updating user..." });
  },
);

router.delete("/:userId", (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Deleting user ${id}...` });
});

module.exports = router;
