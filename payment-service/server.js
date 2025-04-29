const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const errorHandler = require("./src/middleware/errorHandler");
require("./src/config/database");
const paymentRoutes = require("./src/routes/paymentRoutes");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 4006;

app.use(helmet());

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api/payments/webhook", bodyParser.raw({ type: "application/json" }));

app.use("/api/payments", paymentRoutes);

app.use((req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: {
      message: `Not Found - The requested resource ${req.originalUrl} does not exist`,
      status: 404,
    },
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

module.exports = app;
