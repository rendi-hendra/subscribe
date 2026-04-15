const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validateRequest");
const {
  idParamSchema,
  memberCreateSchema,
  memberUpdateSchema,
} = require("../validators/schemas");
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} = require("../controllers/memberController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getMembers);
router.get("/:id", authMiddleware, validate(idParamSchema), getMemberById);
router.post("/", authMiddleware, validate(memberCreateSchema), createMember);
router.put("/:id", authMiddleware, validate(memberUpdateSchema), updateMember);
router.delete("/:id", authMiddleware, validate(idParamSchema), deleteMember);

module.exports = router;
