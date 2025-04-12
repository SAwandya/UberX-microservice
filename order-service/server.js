const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Log all incoming requests
app.use((req, res, next) => {
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// GET endpoint for orders list
app.get('/api/orders', (req, res) => {
  console.log("GET request received for /api/orders");
  try {
    res.status(200).json({
      message: "Orders retrieved successfully",
      orders: []
    });
  } catch (error) {
    console.error("Error processing GET /api/orders:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
});

// GET endpoint for specific order with ID parameter
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  console.log(`GET request received for specific order: ${orderId}`);
  try {
    res.status(200).json({
      message: "Order retrieved successfully",
      order: {
        id: orderId,
        status: "pending",
        items: [],
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Error processing GET /api/orders/${orderId}:`, error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
});

// POST endpoint for creating orders
app.post('/api/orders', (req, res) => {
  console.log("POST request received for /api/orders");
  try {
    const newOrder = {
      id: Math.floor(Math.random() * 1000),
      ...req.body,
      status: "created",
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });
  } catch (error) {
    console.error("Error processing POST /api/orders:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: "Server Error",
    message: err.message || "An unexpected error occurred"
  });
});

// Handle 404s
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});

module.exports = app;