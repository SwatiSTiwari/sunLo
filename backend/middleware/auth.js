const { getAuth } = require("firebase-admin/auth");
const { db, app } = require("../config/firebaseAdmin");

async function verifyIdToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("verifyIdToken error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

async function requireAdmin(req, res, next) {
  if (!req.user?.uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const snap = await db.collection("users").doc(req.user.uid).get();
    if (!snap.exists || snap.data().role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  } catch (err) {
    console.error("requireAdmin error:", err);
    return res.status(500).json({ error: "Admin check failed" });
  }
}

module.exports = { verifyIdToken, requireAdmin };
