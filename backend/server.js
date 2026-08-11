require("dotenv").config();
const express = require("express");
const cors = require("cors");
const paymentRoutes = require("./routes/payment");
const notificationRoutes = require("./routes/notifications");
const meetingRoutes = require("./routes/meetings");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "SunLo backend" });
});

app.listen(PORT, () => {
  console.log(`SunLo backend running on port ${PORT}`);
});
