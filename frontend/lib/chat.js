import {
  ref,
  push,
  onValue,
  off,
  set,
  onDisconnect,
  serverTimestamp as rtdbServerTimestamp,
} from "firebase/database";
import { rtdb } from "./firebase";

export function sendMessage(bookingId, message) {
  const messagesRef = ref(rtdb, `chats/${bookingId}/messages`);
  return push(messagesRef, {
    ...message,
    timestamp: Date.now(),
  });
}

export function subscribeToMessages(bookingId, callback) {
  const messagesRef = ref(rtdb, `chats/${bookingId}/messages`);
  onValue(messagesRef, (snap) => {
    const data = snap.val() || {};
    const list = Object.entries(data)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => a.timestamp - b.timestamp);
    callback(list);
  });
  return () => off(messagesRef);
}

export function setTyping(bookingId, userKey, isTyping) {
  const typingRef = ref(rtdb, `chats/${bookingId}/typing/${userKey}`);
  set(typingRef, isTyping);
}

export function subscribeToTyping(bookingId, callback) {
  const typingRef = ref(rtdb, `chats/${bookingId}/typing`);
  onValue(typingRef, (snap) => {
    callback(snap.val() || {});
  });
  return () => off(typingRef);
}
