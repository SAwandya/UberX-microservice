const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const orderEventSubscriber = require("./events/subscribers/orderEventSubscriber");
const natsConnectionManager = require("./utils/natsConnectionManager");

const app = express();
const PORT = process.env.PORT || 4002; // Default port changed for Delivery Service

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
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// GET endpoint for delivery list
app.get("/api/deliveries", (req, res) => {
  console.log("GET request received for /api/deliveries");
  try {
    res.status(200).json({
      message: "Deliveries retrieved successfully",
      deliveries: [],
    });
  } catch (error) {
    console.error("Error processing GET /api/deliveries:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// GET endpoint for specific delivery
app.get("/api/deliveries/:id", (req, res) => {
  const deliveryId = req.params.id;
  console.log(`GET request received for delivery ID: ${deliveryId}`);
  try {
    res.status(200).json({
      message: "Delivery retrieved successfully",
      delivery: {
        id: deliveryId,
        status: "in_transit",
        items: [],
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`Error processing GET /api/deliveries/${deliveryId}:`, error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// POST endpoint for creating deliveries
app.post("/api/deliveries", (req, res) => {
  console.log("POST request received for /api/deliveries");
  try {
    const newDelivery = {
      id: Math.floor(Math.random() * 1000),
      ...req.body,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      message: "Delivery created successfully",
      delivery: newDelivery,
    });
  } catch (error) {
    console.error("Error processing POST /api/deliveries:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Server Error",
    message: err.message || "An unexpected error occurred",
  });
});

// Handle 404s
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found",
  });
});

//================ NATS RELATED ==================

// Start the server
app.listen(PORT, async () => {
  console.log(`Delivery service running on port ${PORT}`);
  
  // Subscribe to order events
  try {
    await orderEventSubscriber.subscribeToEvents();
    console.log('Successfully subscribed to order events');
  } catch (error) {
    console.error('Failed to subscribe to order events:', error);
  }
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down delivery service...');
  await natsConnectionManager.disconnect();
  process.exit(0);
});

//==================================================

// Start server
app.listen(PORT, () => {
  console.log(`Delivery service running on port ${PORT}`);
});

module.exports = app;
