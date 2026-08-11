import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { API_BASE } from "./api";

async function getIdToken() {
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not authenticated");
  return currentUser.getIdToken();
}

export async function notifyBookingConfirmed(bookingId) {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}/api/notifications/notify-booking-confirmed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Notification failed");
  return data;
}

export function subscribeNotifications(userId, callback) {
  if (!db || !userId) return () => {};
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

export function subscribeUnreadNotifications(userId, callback) {
  if (!db || !userId) return () => {};
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.size);
  });
}

export async function markNotificationRead(notificationId) {
  if (!db) return;
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
}
