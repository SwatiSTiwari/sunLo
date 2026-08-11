const express = require("express");
const { verifyIdToken } = require("../middleware/auth");
const { db, rtdb } = require("../config/firebaseAdmin");
const { createMeetEvent } = require("../services/calendar");
const { sendMeetingLinkNotification } = require("../services/notifications");

const router = express.Router();

router.post("/create", verifyIdToken, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId || typeof bookingId !== "string") {
      return res.status(400).json({ error: "bookingId required" });
    }

    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = { bookingId, ...bookingSnap.data() };
    if (req.user.uid !== booking.companionId) {
      return res.status(403).json({ error: "Only the companion can create a meeting" });
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({ error: "Booking must be confirmed" });
    }

    const startTime = booking.sessionStartTime
      ? new Date(booking.sessionStartTime).toISOString()
      : new Date().toISOString();
    const endTime = new Date(
      new Date(startTime).getTime() + (booking.duration || 15) * 60 * 1000
    ).toISOString();

    const attendees = [
      { email: booking.userEmail },
      { email: booking.companionEmail },
    ];

    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    const event = await createMeetEvent({
      bookingId,
      summary: `SunLo session — ${booking.userName || "User"} & ${booking.companionName || "Companion"}`,
      description: "SunLo companion session",
      startTime,
      endTime,
      attendees,
      calendarId,
    });

    await bookingRef.update({
      meetLink: event.meetLink,
      calendarEventId: event.eventId,
      meetingStatus: "scheduled",
    });

    const messageRef = rtdb.ref(`chats/${bookingId}/messages`);
    await messageRef.push({
      senderId: "system",
      senderName: "SunLo",
      text: `Google Meet link: ${event.meetLink}`,
      timestamp: Date.now(),
    });

    await sendMeetingLinkNotification({ booking: { ...booking, meetLink: event.meetLink }, meetLink: event.meetLink });

    res.json({ success: true, meetLink: event.meetLink, calendarEventId: event.eventId });
  } catch (err) {
    console.error("Create meeting error:", err);
    res.status(500).json({ error: err.message || "Failed to create meeting" });
  }
});

router.post("/resend", verifyIdToken, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId || typeof bookingId !== "string") {
      return res.status(400).json({ error: "bookingId required" });
    }
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const booking = { bookingId, ...bookingSnap.data() };
    if (req.user.uid !== booking.companionId) {
      return res.status(403).json({ error: "Only the companion can resend a meeting" });
    }
    if (!booking.meetLink) {
      return res.status(400).json({ error: "No meeting link exists" });
    }
    const messageRef = rtdb.ref(`chats/${bookingId}/messages`);
    await messageRef.push({
      senderId: "system",
      senderName: "SunLo",
      text: `Google Meet link: ${booking.meetLink}`,
      timestamp: Date.now(),
    });
    await sendMeetingLinkNotification({ booking, meetLink: booking.meetLink });
    res.json({ success: true, meetLink: booking.meetLink });
  } catch (err) {
    console.error("Resend meeting error:", err);
    res.status(500).json({ error: err.message || "Failed to resend meeting" });
  }
});

module.exports = router;
