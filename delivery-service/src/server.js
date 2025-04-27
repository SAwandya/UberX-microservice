// const express = require("express");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const orderEventSubscriber = require("./events/subscribers/orderEventSubscriber");
// const natsConnectionManager = require("./utils/natsConnectionManager");

// const app = express();
// const PORT = process.env.PORT || 5000; // Changed to match your K8s deployment port

// // Middleware
// app.use(express.json());
// app.use(cookieParser());
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN || "*",
//     credentials: true,
//   })
// );

// // Log all incoming requests
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });

// // Health check endpoint
// app.get("/health", (req, res) => {
//   res.status(200).send("OK");
// });

// // GET endpoint for delivery list
// app.get("/api/deliveries", (req, res) => {
//   console.log("GET request received for /api/deliveries");
//   try {
//     res.status(200).json({
//       message: "Deliveries retrieved successfully",
//       deliveries: [],
//     });
//   } catch (error) {
//     console.error("Error processing GET /api/deliveries:", error);
//     res.status(500).json({
//       error: "Internal server error",
//       details: error.message,
//     });
//   }
// });

// // GET endpoint for specific delivery
// app.get("/api/deliveries/:id", (req, res) => {
//   const deliveryId = req.params.id;
//   console.log(`GET request received for delivery ID: ${deliveryId}`);
//   try {
//     res.status(200).json({
//       message: "Delivery retrieved successfully",
//       delivery: {
//         id: deliveryId,
//         status: "in_transit",
//         items: [],
//         createdAt: new Date().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error(`Error processing GET /api/deliveries/${deliveryId}:`, error);
//     res.status(500).json({
//       error: "Internal server error",
//       details: error.message,
//     });
//   }
// });

// // POST endpoint for creating deliveries
// app.post("/api/deliveries", (req, res) => {
//   console.log("POST request received for /api/deliveries");
//   try {
//     const newDelivery = {
//       id: Math.floor(Math.random() * 1000),
//       ...req.body,
//       status: "scheduled",
//       createdAt: new Date().toISOString(),
//     };

//     res.status(201).json({
//       message: "Delivery created successfully",
//       delivery: newDelivery,
//     });
//   } catch (error) {
//     console.error("Error processing POST /api/deliveries:", error);
//     res.status(500).json({
//       error: "Internal server error",
//       details: error.message,
//     });
//   }
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err);
//   res.status(500).json({
//     error: "Server Error",
//     message: err.message || "An unexpected error occurred",
//   });
// });

// // Handle 404s
// app.use((req, res) => {
//   console.log(`Route not found: ${req.method} ${req.url}`);
//   res.status(404).json({
//     error: "Not Found",
//     message: "The requested resource was not found",
//   });
// });

// // Start the server - ONLY ONE app.listen CALL
// const server = app.listen(PORT, async () => {
//   console.log(`Delivery service running on port ${PORT}`);

//   // Try to connect to NATS with initial delay to ensure stability
//   setTimeout(async () => {
//     try {
//       // Connect to NATS before subscribing
//       await natsConnectionManager.connect();
//       console.log("Connected to NATS, subscribing to events...");

//       // Subscribe to order events after connection
//       await orderEventSubscriber.subscribeToEvents();
//       console.log("Successfully subscribed to order events");
//     } catch (error) {
//       console.error("Failed to connect to NATS or subscribe to events:", error);
//     }
//   }, 5000); // 5 second delay to allow network stability
// });

// // Handle graceful shutdown
// process.on("SIGINT", async () => {
//   console.log("Shutting down delivery service...");
//   await natsConnectionManager.disconnect();
//   server.close(() => {
//     console.log("HTTP server closed");
//     process.exit(0);
//   });
// });

// process.on("SIGTERM", async () => {
//   console.log("Termination signal received, shutting down...");
//   await natsConnectionManager.disconnect();
//   server.close(() => {
//     console.log("HTTP server closed");
//     process.exit(0);
//   });
// });

// module.exports = app;

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const { PORT, CORS_ORIGIN } = require('./config/environment');
const tripRoutes = require('./routes/tripRoutes');
const locationRoutes = require('./routes/locationRoutes');
const errorHandler = require('./middleware/errorHandler');
const orderEventSubscriber = require('./events/subscribers/orderEventSubscriber');
const riderRoutes = require('./routes/riderRoutes');

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();
const server = http.createServer(app);

// Safely handle CORS_ORIGIN
const corsOrigins = CORS_ORIGIN ? CORS_ORIGIN.split(',') : ['http://localhost:3000'];

const io = socketIo(server, {
    cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST']
    }
});

app.use(express.json());

// WebSocket connection
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('join_trip', (tripId) => {
        socket.join(`trip:${tripId}`);
        console.log(`Client joined trip:${tripId}`);
    });
});

app.set('io', io);

// Health endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Routes
app.use('/api/trips', tripRoutes);
app.use('/api', locationRoutes);
app.use("/api/riders", riderRoutes);

// Error Handler
app.use(errorHandler);

// Start the server and NATS subscriber
const startServer = async () => {
    try {
        // await orderEventSubscriber.subscribe();
        // console.log('Successfully subscribed to NATS events');

        server.listen(PORT, () => {
            console.log(`Delivery Service running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Error subscribing to NATS events:', err);
        process.exit(1);
    }
};

startServer();