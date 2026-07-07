require("dotenv").config();
const express = require("express");
const cors = require("cors");
const paymentRoutes = require("/Users/swatitiwari/Documents/sunLo/backend/routes/payment");

const app = express();
const PORT = 5562;

app.use(cors());
app.use(express.json());

app.use("/api/payment", paymentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "SunLo backend" });
});

app.listen(PORT, () => {
  console.log(`SunLo backend running on port ${PORT}`);
});
