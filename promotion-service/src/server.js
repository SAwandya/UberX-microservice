// src/app.js
const express = require("express");
const cors = require("cors");
const promotionRoutes = require("./routes/promotionRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/promotions", promotionRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () =>
  console.log(`Promotion service listening on port ${PORT}`)
);
