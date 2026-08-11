const express = require("express");
const { verifyIdToken } = require("../middleware/auth");
const { db } = require("../config/firebaseAdmin");
const { sendBookingConfirmedNotification } = require("../services/notifications");

const router = express.Router();

router.post("/notify-booking-confirmed", verifyIdToken, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId || typeof bookingId !== "string") {
      return res.status(400).json({ error: "bookingId required" });
    }

    const bookingSnap = await db.collection("bookings").doc(bookingId).get();
    if (!bookingSnap.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = { bookingId, ...bookingSnap.data() };
    const callerUid = req.user.uid;
    const isParticipant = callerUid === booking.userId || callerUid === booking.companionId;
    if (!isParticipant) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ error: "Booking not confirmed" });
    }

    await sendBookingConfirmedNotification(booking);
    res.json({ success: true });
  } catch (err) {
    console.error("notify-booking-confirmed error:", err);
    res.status(500).json({ error: err.message || "Notification failed" });
  }
});

module.exports = router;
