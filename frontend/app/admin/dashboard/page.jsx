"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/authContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotificationBell from "@/components/NotificationBell";
import Button from "@/components/ui/Button";
import { getReports, updateReportStatus, suspendUser, suspendCompanion } from "@/lib/admin";
import { toast } from "react-hot-toast";

function AdminDashboard() {
  const { userData } = useAuth();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReports(filter);
      setReports(data);
    } catch (err) {
      console.error("Load reports error:", err);
      toast.error(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function handleResolve(reportId) {
    try {
      await updateReportStatus(reportId, { status: "resolved", resolutionNote });
      toast.success("Report marked resolved");
      setResolutionNote("");
      setSelected(null);
      loadReports();
    } catch (err) {
      toast.error(err.message || "Failed to resolve report");
    }
  }

  async function handleSuspendUser(userId, type) {
    try {
      if (type === "companion") {
        await suspendCompanion(userId, true);
      } else {
        await suspendUser(userId, true);
      }
      toast.success("Account suspended");
      loadReports();
    } catch (err) {
      toast.error(err.message || "Failed to suspend");
    }
  }

  async function handleUnsuspendUser(userId, type) {
    try {
      if (type === "companion") {
        await suspendCompanion(userId, false);
      } else {
        await suspendUser(userId, false);
      }
      toast.success("Account unsuspended");
      loadReports();
    } catch (err) {
      toast.error(err.message || "Failed to unsuspend");
    }
  }

  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("en-IN");
  };

  return (
    <div className="min-h-screen bg-sunlo-background">
      <header className="border-b border-orange-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-sunlo-text">Admin Dashboard</h1>
          <NotificationBell />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          {["pending", "resolved", "all"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all ${
                filter === s
                  ? "bg-gradient-to-r from-sunlo-primary to-sunlo-accent text-white shadow-button"
                  : "bg-white text-sunlo-text shadow-soft"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-sunlo-primary border-t-transparent" />
          </div>
        ) : reports.length === 0 ? (
          <p className="py-8 text-center text-sunlo-muted">No reports found.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div key={r.reportId} className="rounded-3xl bg-white p-5 shadow-card">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-sunlo-text">
                      Report by {r.reporterName} ({r.reporterEmail})
                    </p>
                    <p className="text-sm text-sunlo-text">
                      Against {r.reportedName} ({r.reportedEmail})
                    </p>
                    <p className="text-xs text-sunlo-muted">Booking: {r.bookingId} • {formatDate(r.createdAt)}</p>
                  </div>
                  <span
                    className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${
                      r.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="mt-3 rounded-2xl bg-sunlo-secondary-light p-3">
                  <p className="text-sm text-sunlo-text">{r.reason}</p>
                </div>

                {r.booking && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-sunlo-muted">
                    <div>Duration: {r.booking.duration} min</div>
                    <div>Amount: ₹{r.booking.amount}</div>
                    <div>Status: {r.booking.status}</div>
                    <div>Meet link: {r.booking.meetLink ? "Yes" : "No"}</div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {r.status === "pending" && (
                    <Button onClick={() => setSelected(r)} variant="outline" className="text-xs">
                      Resolve
                    </Button>
                  )}
                  <Button
                    onClick={() => handleSuspendUser(r.reportedUser, "user")}
                    variant="outline"
                    className="text-xs text-red-600"
                  >
                    Suspend User
                  </Button>
                  <Button
                    onClick={() => handleUnsuspendUser(r.reportedUser, "user")}
                    variant="outline"
                    className="text-xs"
                  >
                    Unsuspend User
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="mb-3 text-lg font-bold text-sunlo-text">Resolve Report</h3>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Add a resolution note..."
              className="mb-4 w-full rounded-2xl border border-orange-100 bg-sunlo-background px-4 py-3 text-sm text-sunlo-text placeholder-sunlo-muted/60 focus:border-sunlo-primary focus:outline-none focus:ring-2 focus:ring-sunlo-secondary/50"
              rows={3}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelected(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => handleResolve(selected.reportId)} className="flex-1">
                Mark Resolved
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
