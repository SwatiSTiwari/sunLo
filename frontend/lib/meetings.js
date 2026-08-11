import { auth } from "./firebase";
import { API_BASE } from "./api";

async function getIdToken() {
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not authenticated");
  return currentUser.getIdToken();
}

export async function createMeeting(bookingId) {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}/api/meetings/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create meeting");
  return data;
}

export async function resendMeetingLink(bookingId) {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}/api/meetings/resend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to resend meeting");
  return data;
}

export function getMeetingStatus(booking) {
  const now = Date.now();
  const start = booking?.sessionStartTime ? new Date(booking.sessionStartTime).getTime() : null;
  const end = booking?.sessionEndTime
    ? new Date(booking.sessionEndTime).getTime()
    : start
    ? start + (booking.duration || 15) * 60 * 1000
    : null;

  if (!booking?.meetLink) return null;
  if (start && now < start) return "Scheduled";
  if (end && now > end) return "Completed";
  return "Active";
}
