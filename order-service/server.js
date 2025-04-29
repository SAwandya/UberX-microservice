const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const orderRoutes = require('./src/routes/orderRoutes');
const errorHandler = require('./src/middlewares/errorHandler');
require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 4001;

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

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api/orders', orderRoutes);

app.use((req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: {
      message: `Not Found - The requested resource ${req.originalUrl} does not exist`,
      status: 404
    }
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});

module.exports = app;