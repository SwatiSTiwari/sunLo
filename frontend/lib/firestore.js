import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

export async function getUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

export async function getUserByEmail(email) {
  const q = query(
    collection(db, "users"),
    where("email", "==", email),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { uid: docSnap.id, ...docSnap.data() };
}

export async function updateUser(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function createCompanion(uid, data) {
  await setDoc(doc(db, "companions", uid), {
    ...data,
    uid,
    rating: 0,
    totalSessions: 0,
    totalEarnings: 0,
    isAvailable: false,
    createdAt: new Date().toISOString(),
  });
  await updateDoc(doc(db, "users", uid), { profileComplete: true });
}

export async function getCompanion(uid) {
  const snap = await getDoc(doc(db, "companions", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

export async function getCompanions(filters = {}) {
  const ref = collection(db, "companions");
  let q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  let list = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));

  if (filters.language) {
    list = list.filter((c) => (c.languages || []).includes(filters.language));
  }
  if (filters.available) {
    list = list.filter((c) => c.isAvailable);
  }
  if (filters.minRating) {
    list = list.filter((c) => (c.rating || 0) >= filters.minRating);
  }
  return list;
}

export async function updateCompanion(uid, data) {
  await setDoc(doc(db, "companions", uid), data, { merge: true });
}

export async function createBooking(data) {
  const bookingId = `${data.userId}_${Date.now()}`;
  const [companionSnap, userSnap] = await Promise.all([
    getDoc(doc(db, "companions", data.companionId)),
    getDoc(doc(db, "users", data.userId)),
  ]);
  const companion = companionSnap.exists() ? companionSnap.data() : {};
  const user = userSnap.exists() ? userSnap.data() : {};
  await setDoc(doc(db, "bookings", bookingId), {
    ...data,
    bookingId,
    status: data.status || "pending",
    companionPhoto: companion.photoURL || companion.photo || "",
    userPhoto: user.photoURL || "",
    createdAt: new Date().toISOString(),
  });
  return bookingId;
}

export async function getBooking(bookingId) {
  const snap = await getDoc(doc(db, "bookings", bookingId));
  return snap.exists() ? { bookingId, ...snap.data() } : null;
}

export async function updateBooking(bookingId, data) {
  await updateDoc(doc(db, "bookings", bookingId), data);
}

export async function getUserBookings(userId) {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ bookingId: d.id, ...d.data() }));
}

export async function getCompanionBookings(companionId) {
  const q = query(
    collection(db, "bookings"),
    where("companionId", "==", companionId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ bookingId: d.id, ...d.data() }));
}

export async function createReview(data) {
  await addDoc(collection(db, "reviews"), {
    ...data,
    createdAt: new Date().toISOString(),
  });
}

export async function getCompanionReviews(companionId) {
  const q = query(
    collection(db, "reviews"),
    where("companionId", "==", companionId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ reviewId: d.id, ...d.data() }));
}

export async function createReport(data) {
  await addDoc(collection(db, "reports"), {
    ...data,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
}

export async function updateReportStatus(reportId, data) {
  await updateDoc(doc(db, "reports", reportId), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}
