const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validateRequest");
const {
  paymentCreateSchema,
  paymentNotificationSchema,
} = require("../validators/schemas");
const { createPayment } = require("../controllers/paymentController");
const {
  handleNotification,
} = require("../controllers/paymentNotificationController");

router.post(
  "/create",
  authMiddleware,
  validate(paymentCreateSchema),
  createPayment,
);
router.post(
  "/notification",
  validate(paymentNotificationSchema),
  handleNotification,
);

module.exports = router;
