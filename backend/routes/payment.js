require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const { db } = require("../config/firebaseAdmin");

const router = express.Router();

function validateAmount(amount) {
  const num = Number(amount);
  return Number.isFinite(num) && num > 0 && num <= 50000;
}

router.post("/create-order", async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: "Razorpay not configured" });
    }

    const { amount, bookingId, notes = {} } = req.body;
    if (!amount || !bookingId) {
      return res.status(400).json({ error: "amount and bookingId required" });
    }
    if (typeof bookingId !== "string" || bookingId.length < 3) {
      return res.status(400).json({ error: "Invalid bookingId" });
    }
    if (!validateAmount(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: String(bookingId).slice(0, 40),
      notes: typeof notes === "object" && notes !== null ? notes : {},
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ error: "Razorpay not configured" });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }
    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      typeof bookingId !== "string"
    ) {
      return res.status(400).json({ error: "Invalid field types" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const bookingData = bookingSnap.data();
    if (bookingData.status === "confirmed" || bookingData.status === "completed") {
      return res.json({ success: true, bookingId, alreadyPaid: true });
    }

    await bookingRef.update({
      status: "confirmed",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paidAt: new Date().toISOString(),
    });

    res.json({ success: true, bookingId });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ error: err.message || "Payment verification failed" });
  }
});

// Optional: free session endpoint (frontend can also handle this directly)
router.post("/free", async (req, res) => {
  try {
    const { userId, companionId, duration, amount, companionEarnings, platformFee } = req.body;
    if (!userId || !companionId || !duration) {
      return res.status(400).json({ error: "userId, companionId, and duration required" });
    }
    const bookingId = `${userId}_${Date.now()}`;
    await db.collection("bookings").doc(bookingId).set({
      userId,
      companionId,
      duration,
      amount: amount || 0,
      companionEarnings: companionEarnings || 0,
      platformFee: platformFee || 0,
      status: "confirmed",
      bookingId,
      createdAt: new Date().toISOString(),
    });
    res.json({ success: true, bookingId });
  } catch (err) {
    console.error("Free session error:", err);
    res.status(500).json({ error: err.message || "Failed to create free booking" });
  }
});

module.exports = router;
