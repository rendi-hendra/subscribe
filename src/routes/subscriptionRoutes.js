const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const subscriptionMiddleware = require("../middleware/subscriptionMiddleware");
const { validate } = require("../middleware/validateRequest");
const {
  idParamSchema,
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
} = require("../validators/schemas");
const {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
} = require("../controllers/subscriptionController");

router.get("/", authMiddleware, getSubscriptions);
router.get(
  "/:id",
  authMiddleware,
  validate(idParamSchema),
  getSubscriptionById,
);
router.post(
  "/",
  authMiddleware,
  validate(subscriptionCreateSchema),
  createSubscription,
);
router.put(
  "/:id",
  authMiddleware,
  validate(subscriptionUpdateSchema),
  updateSubscription,
);

module.exports = router;
