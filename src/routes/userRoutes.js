const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validateRequest");
const { idParamSchema, userCreateSchema } = require("../validators/schemas");
const {
  getUsers,
  getUserById,
  createUser,
} = require("../controllers/userController");

router.get("/", getUsers);
router.get("/:id", validate(idParamSchema), getUserById);
router.post("/", validate(userCreateSchema), createUser);

module.exports = router;
