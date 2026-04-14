const express = require("express");
const { validate } = require("../middleware/validateRequest");
const { authLoginSchema, authRefreshSchema } = require("../validators/schemas");
const {
  login,
  refreshToken,
  logout,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", validate(authLoginSchema), login);
router.post("/refresh", validate(authRefreshSchema), refreshToken);
router.post("/logout", validate(authRefreshSchema), logout);

module.exports = router;
