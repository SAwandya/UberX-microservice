// order-service/server.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const orderRoutes = require('./src/routes/orderRoutes'); // Import the actual order routes
const errorHandler = require('./src/middlewares/errorHandler'); // Import the centralized error handler
require('./src/config/database'); // Initialize database connection pool (runs the code in database.js)

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(express.json()); // <-- Make sure this is before routes to parse JSON body
app.use(cookieParser()); // Keep if needed, but auth primarily uses Bearer token now
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Adjust CORS for your frontend/clients
    credentials: true, // Usually needed if frontend sends cookies/auth headers
  })
);

// Log all incoming requests (optional for debugging)
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  // You could enhance this later to check DB connectivity too
  res.status(200).send('OK');
});

// --- Mount API Routes ---
// All routes defined in orderRoutes will be prefixed with /api/orders
app.use('/api/orders', orderRoutes);

// --- Error Handling ---
// Handle 404s - This should come *after* all valid routes
app.use((req, res, next) => {
  // No route matched the request
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: {
      message: `Not Found - The requested resource ${req.originalUrl} does not exist`,
      status: 404
    }
  });
});

// Centralized error handler - This MUST be the last middleware defined
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});

module.exports = app; // Export for potential testing frameworks