const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validateRequest");
const { idParamSchema, planCreateSchema, planUpdateSchema } = require("../validators/schemas");
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} = require("../controllers/planController");

router.get("/", getPlans);
router.get("/:id", validate(idParamSchema), getPlanById);
router.post("/", authMiddleware, validate(planCreateSchema), createPlan);
router.put("/:id", authMiddleware, validate(planUpdateSchema), updatePlan);
router.delete("/:id", authMiddleware, validate(idParamSchema), deletePlan);

module.exports = router;
