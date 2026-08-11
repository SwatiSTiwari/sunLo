import { auth } from "./firebase";
import { API_BASE } from "./api";

async function getIdToken() {
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not authenticated");
  return currentUser.getIdToken();
}

export async function getReports(status = "all") {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}/api/admin/reports?status=${encodeURIComponent(status)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch reports");
  return data.reports || [];
}

export async function updateReportStatus(reportId, { status, resolutionNote }) {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}/api/admin/reports/${reportId}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, resolutionNote }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update report");
  return data;
}

export async function suspendUser(userId, suspended) {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/suspend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ suspended }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update user");
  return data;
}

export async function suspendCompanion(companionId, suspended) {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}/api/admin/companions/${companionId}/suspend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ suspended }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update companion");
  return data;
}

export async function getAdminBooking(bookingId) {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE}/api/admin/bookings/${bookingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch booking");
  return data.booking;
}
