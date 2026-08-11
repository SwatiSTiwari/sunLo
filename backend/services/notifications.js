const { db } = require("../config/firebaseAdmin");
const { sendEmail } = require("./resend");

async function createNotification(notification) {
  const ref = db.collection("notifications").doc();
  const data = {
    ...notification,
    read: false,
    createdAt: new Date().toISOString(),
  };
  await ref.set(data);
  return { id: ref.id, ...data };
}

async function sendBookingConfirmedNotification(booking) {
  if (!booking?.companionId) {
    throw new Error("Invalid booking");
  }

  const [companionSnap, userSnap] = await Promise.all([
    db.collection("users").doc(booking.companionId).get(),
    db.collection("users").doc(booking.userId).get(),
  ]);

  const companion = companionSnap.exists ? companionSnap.data() : null;
  const user = userSnap.exists ? userSnap.data() : null;

  if (!companion) return;

  const userName = booking.userName || user?.name || user?.email || "Someone";
  const companionEmail = booking.companionEmail || companion.email;

  await createNotification({
    userId: booking.companionId,
    type: "booking_confirmed",
    title: "New chat request",
    body: `${userName} booked a ${booking.duration || 15}-minute session with you.`,
    bookingId: booking.bookingId,
    metadata: { userName, duration: booking.duration },
  });

  if (companionEmail) {
    const dashboardUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard/companion`;
    try {
      await sendEmail({
        to: companionEmail,
        subject: "New SunLo chat request",
        html: `
          <p>Hi ${companion.name || ""},</p>
          <p><strong>${userName}</strong> just booked a ${booking.duration || 15}-minute session with you.</p>
          <p><a href="${dashboardUrl}">Open your dashboard</a> to start chatting.</p>
          <p>- SunLo</p>
        `,
      });
    } catch (err) {
      console.error("Failed to send booking confirmation email:", err);
    }
  }
}

async function sendMeetingLinkNotification({ booking, meetLink }) {
  const [companionSnap, userSnap] = await Promise.all([
    db.collection("users").doc(booking.companionId).get(),
    db.collection("users").doc(booking.userId).get(),
  ]);

  const user = userSnap.exists ? userSnap.data() : null;
  const companion = companionSnap.exists ? companionSnap.data() : null;

  const userEmail = booking.userEmail || user?.email;
  const companionName = booking.companionName || companion?.name || "Companion";

  await createNotification({
    userId: booking.userId,
    type: "meeting_link",
    title: "Meet link ready",
    body: `${companionName} generated a Google Meet link for your session.`,
    bookingId: booking.bookingId,
    metadata: { meetLink },
  });

  if (userEmail) {
    const chatUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/chat/${booking.bookingId}`;
    try {
      await sendEmail({
        to: userEmail,
        subject: "Your SunLo Google Meet link",
        html: `
          <p>Hi ${user?.name || ""},</p>
          <p>${companionName} generated a Google Meet link for your session:</p>
          <p><a href="${meetLink}">${meetLink}</a></p>
          <p>You can also view it in <a href="${chatUrl}">your chat</a>.</p>
          <p>- SunLo</p>
        `,
      });
    } catch (err) {
      console.error("Failed to send meeting link email:", err);
    }
  }
}

module.exports = {
  createNotification,
  sendBookingConfirmedNotification,
  sendMeetingLinkNotification,
};
