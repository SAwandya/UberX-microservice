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

// Assuming Express
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/api/orders', (req, res) => {
  // Placeholder for order retrieval logic
  console.log("Received request");
  console.log("Headers:", req.headers); // ✅ add this
  res.status(200).json({ message: "Orders retrieved successfully" });
});


// Start server
app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});

module.exports = app;
