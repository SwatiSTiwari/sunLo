const express = require("express");
const { verifyIdToken, requireAdmin } = require("../middleware/auth");
const { db } = require("../config/firebaseAdmin");

const router = express.Router();
router.use(verifyIdToken, requireAdmin);

async function getUserNameAndEmail(uid) {
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) return { name: "Unknown", email: "" };
  const data = snap.data();
  return { name: data.name || data.email || "Unknown", email: data.email || "" };
}

router.get("/reports", async (req, res) => {
  try {
    const { status = "all" } = req.query;
    let query = db.collection("reports").orderBy("createdAt", "desc");
    if (status === "pending" || status === "resolved") {
      query = query.where("status", "==", status);
    }
    const snap = await query.limit(100).get();

    const reports = await Promise.all(
      snap.docs.map(async (docSnap) => {
        const report = { reportId: docSnap.id, ...docSnap.data() };
        const [reporter, reported, bookingSnap] = await Promise.all([
          getUserNameAndEmail(report.reportedBy),
          getUserNameAndEmail(report.reportedUser),
          db.collection("bookings").doc(report.bookingId).get(),
        ]);
        return {
          ...report,
          reporterName: reporter.name,
          reporterEmail: reporter.email,
          reportedName: reported.name,
          reportedEmail: reported.email,
          booking: bookingSnap.exists ? { bookingId: bookingSnap.id, ...bookingSnap.data() } : null,
        };
      })
    );

    res.json({ reports });
  } catch (err) {
    console.error("GET /admin/reports error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch reports" });
  }
});

router.post("/reports/:reportId/status", async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, resolutionNote = "" } = req.body;
    if (!["pending", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const update = { status, resolutionNote };
    if (status === "resolved") {
      update.resolvedAt = new Date().toISOString();
    }
    await db.collection("reports").doc(reportId).update(update);
    res.json({ success: true });
  } catch (err) {
    console.error("Update report status error:", err);
    res.status(500).json({ error: err.message || "Failed to update report" });
  }
});

router.post("/users/:userId/suspend", async (req, res) => {
  try {
    const { userId } = req.params;
    const { suspended } = req.body;
    if (typeof suspended !== "boolean") {
      return res.status(400).json({ error: "suspended must be boolean" });
    }
    await db.collection("users").doc(userId).update({ suspended });
    res.json({ success: true });
  } catch (err) {
    console.error("Suspend user error:", err);
    res.status(500).json({ error: err.message || "Failed to update user" });
  }
});

router.post("/companions/:companionId/suspend", async (req, res) => {
  try {
    const { companionId } = req.params;
    const { suspended } = req.body;
    if (typeof suspended !== "boolean") {
      return res.status(400).json({ error: "suspended must be boolean" });
    }
    const batch = db.batch();
    batch.update(db.collection("companions").doc(companionId), { suspended });
    batch.update(db.collection("users").doc(companionId), { suspended });
    await batch.commit();
    res.json({ success: true });
  } catch (err) {
    console.error("Suspend companion error:", err);
    res.status(500).json({ error: err.message || "Failed to update companion" });
  }
});

router.get("/bookings/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const snap = await db.collection("bookings").doc(bookingId).get();
    if (!snap.exists) return res.status(404).json({ error: "Booking not found" });
    res.json({ booking: { bookingId: snap.id, ...snap.data() } });
  } catch (err) {
    console.error("GET admin booking error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch booking" });
  }
});

module.exports = router;
