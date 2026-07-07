const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getDatabase } = require("firebase-admin/database");
const path = require("path");

const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

const app = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccountPath),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })
  : getApps()[0];

const db = getFirestore(app);
const rtdb = getDatabase(app);

module.exports = { db, rtdb, app };
