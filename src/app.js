require("dotenv").config();
require("reflect-metadata");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../doc/swagger.json");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const planRoutes = require("./routes/planRoutes");
const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const abilityMiddleware = require("./middleware/abilityMiddleware");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/users", userRoutes);
app.use("/api/users", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/members", memberRoutes);

app.use(errorHandler);

module.exports = app;
