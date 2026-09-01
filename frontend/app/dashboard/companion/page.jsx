"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { getCompanionBookings, updateCompanion, getCompanion } from "@/lib/firestore";
import { deleteProfilePhoto } from "@/lib/storage";
import Avatar from "@/components/Avatar";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
import NotificationBell from "@/components/NotificationBell";
import { createMeeting, resendMeetingLink, getMeetingStatus } from "@/lib/meetings";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

export default function CompanionDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["companion"]}>
      <CompanionDashboard />
    </ProtectedRoute>
  );
}

function CompanionDashboard() {
  const { user, userData } = useAuth();
  const [companion, setCompanion] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [generatingMap, setGeneratingMap] = useState({});
  const [resendingMap, setResendingMap] = useState({});

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [compData, bookData] = await Promise.all([
          getCompanion(user.uid),
          getCompanionBookings(user.uid),
        ]);
        setCompanion(compData);
        setBookings(bookData);
      } catch (err) {
        console.error("Companion dashboard load error:", err);
        toast.error(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const now = new Date();

  const getSessionEnd = (b) => {
    if (b.sessionEndTime) return new Date(b.sessionEndTime).getTime();
    const start = b.sessionStartTime
      ? new Date(b.sessionStartTime).getTime()
      : b.createdAt
      ? new Date(b.createdAt).getTime()
      : Date.now();
    return start + (b.duration || 15) * 60 * 1000;
  };

  const getSessionStart = (b) => {
    if (b.sessionStartTime) return new Date(b.sessionStartTime).getTime();
    return b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
  };

  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && getSessionEnd(b) > now.getTime()
  );
  const past = bookings.filter(
    (b) => b.status === "completed" || (b.status === "confirmed" && getSessionEnd(b) <= now.getTime())
  );

  const totalEarned = past.reduce((sum, b) => sum + (b.companionEarnings || 0), 0);
  const thisMonth = past.filter((b) => {
    const d = new Date(getSessionEnd(b));
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthEarned = thisMonth.reduce((sum, b) => sum + (b.companionEarnings || 0), 0);

  const handleToggle = async () => {
    if (!companion) return;
    const next = !companion.isAvailable;
    setIsToggling(true);
    try {
      await updateCompanion(user.uid, { isAvailable: next });
      setCompanion((prev) => ({ ...prev, isAvailable: next }));
      toast.success(next ? "You are now available" : "You are now unavailable");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsToggling(false);
    }
  };

  const handlePhotoUpload = async (result) => {
    try {
      await updateCompanion(user.uid, { photoURL: result.photoURL, photoPath: result.photoPath });
      const refreshed = await getCompanion(user.uid);
      setCompanion(refreshed);
    } catch (err) {
      console.error("Profile photo update error:", err);
      toast.error(err.message || "Failed to save profile photo");
    }
  };

  const handlePhotoRemove = async () => {
    const pathToDelete = companion?.photoPath;
    try {
      await updateCompanion(user.uid, { photoURL: "", photoPath: "" });
      if (pathToDelete) {
        try {
          await deleteProfilePhoto(pathToDelete);
        } catch (deleteErr) {
          console.warn("Failed to delete previous profile photo:", deleteErr);
        }
      }
      const refreshed = await getCompanion(user.uid);
      setCompanion(refreshed);
      toast.success("Profile photo removed");
    } catch (err) {
      console.error("Profile photo remove error:", err);
      toast.error(err.message || "Failed to remove profile photo");
    }
  };

  const formatDate = (iso) => {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  async function handleGenerateMeet(booking) {
    setGeneratingMap((prev) => ({ ...prev, [booking.bookingId]: true }));
    try {
      const result = await createMeeting(booking.bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === booking.bookingId
            ? { ...b, meetLink: result.meetLink, calendarEventId: result.calendarEventId, meetingStatus: "scheduled" }
            : b
        )
      );
      toast.success("Google Meet link generated and shared");
    } catch (err) {
      console.error("Generate meet error:", err);
      toast.error(err.message || "Failed to generate Meet link");
    } finally {
      setGeneratingMap((prev) => ({ ...prev, [booking.bookingId]: false }));
    }
  }

  async function handleResendMeet(booking) {
    setResendingMap((prev) => ({ ...prev, [booking.bookingId]: true }));
    try {
      await resendMeetingLink(booking.bookingId);
      toast.success("Meet link resent");
    } catch (err) {
      console.error("Resend meet error:", err);
      toast.error(err.message || "Failed to resend Meet link");
    } finally {
      setResendingMap((prev) => ({ ...prev, [booking.bookingId]: false }));
    }
  }

  async function handleCopyLink(meetLink) {
    try {
      await navigator.clipboard.writeText(meetLink);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  function renderMeetingActions(booking) {
    const status = getMeetingStatus(booking);
    if (booking.status !== "confirmed") return null;
    if (!booking.meetLink) {
      return (
        <button
          onClick={() => handleGenerateMeet(booking)}
          disabled={generatingMap[booking.bookingId]}
          className="rounded-full bg-gradient-to-r from-sunlo-primary to-sunlo-accent px-3 py-1.5 text-xs font-semibold text-white shadow-button disabled:opacity-50"
        >
          {generatingMap[booking.bookingId] ? "Generating..." : "Generate Meet"}
        </button>
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status === "Active" ? "bg-green-100 text-green-700" : status === "Completed" ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-700"}`}>
          {status || "Scheduled"}
        </span>
        <a
          href={booking.meetLink}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-sunlo-primary/10 px-3 py-1 text-xs font-semibold text-sunlo-primary"
        >
          Join
        </a>
        <button
          onClick={() => handleCopyLink(booking.meetLink)}
          className="rounded-full bg-sunlo-secondary px-3 py-1 text-xs font-semibold text-sunlo-text"
        >
          Copy
        </button>
        <button
          onClick={() => handleResendMeet(booking)}
          disabled={resendingMap[booking.bookingId]}
          className="rounded-full bg-sunlo-secondary px-3 py-1 text-xs font-semibold text-sunlo-text disabled:opacity-50"
        >
          {resendingMap[booking.bookingId] ? "Resending..." : "Resend"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sunlo-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sunlo-text">Hello, {userData?.name || "Friend"} 👋</h1>
            <p className="mt-1 text-sm text-sunlo-muted">Your companion dashboard</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={isToggling || isLoading}
            className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              companion?.isAvailable
                ? "bg-sunlo-success/10 text-sunlo-success"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${companion?.isAvailable ? "bg-sunlo-success" : "bg-gray-400"}`} />
            {companion?.isAvailable ? "Online" : "Offline"}
          </button>
          <NotificationBell />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 rounded-3xl bg-white p-5 shadow-card">
              <h2 className="mb-3 text-lg font-bold text-sunlo-text">Earnings</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-sunlo-secondary-light p-4 text-center">
                  <p className="text-2xl font-bold text-sunlo-text">₹{totalEarned}</p>
                  <p className="text-xs text-sunlo-muted">Total Earned</p>
                </div>
                <div className="rounded-2xl bg-sunlo-secondary-light p-4 text-center">
                  <p className="text-2xl font-bold text-sunlo-text">₹{thisMonthEarned}</p>
                  <p className="text-xs text-sunlo-muted">This Month</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-sunlo-muted">Amount shown is after platform fee deduction.</p>
            </div>

            <div className="mb-6 rounded-3xl bg-white p-5 shadow-card">
              <h2 className="mb-3 text-lg font-bold text-sunlo-text">Upcoming Sessions</h2>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sunlo-primary border-t-transparent" />
                </div>
              ) : upcoming.length === 0 ? (
                <p className="py-4 text-center text-sm text-sunlo-muted">No upcoming sessions</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((b) => (
                    <div key={b.bookingId} className="flex flex-col gap-2 rounded-xl bg-sunlo-secondary-light p-3 sm:flex-row sm:items-center">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-sunlo-text">{b.userName || "User"}</p>
                        <p className="text-xs text-sunlo-muted">{formatDate(getSessionStart(b))}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {renderMeetingActions(b)}
                        <Link href={`/chat/${b.bookingId}`}>
                          <Button className="px-3 py-2 text-xs">Chat</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-card">
              <h2 className="mb-3 text-lg font-bold text-sunlo-text">Past Sessions</h2>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sunlo-primary border-t-transparent" />
                </div>
              ) : past.length === 0 ? (
                <p className="py-4 text-center text-sm text-sunlo-muted">No sessions completed yet</p>
              ) : (
                <div className="space-y-3">
                  {past.map((b) => (
                    <div key={b.bookingId} className="flex items-center gap-3 rounded-xl border border-orange-100 p-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-sunlo-text">{b.userName || "User"}</p>
                        <p className="text-xs text-sunlo-muted">{formatDate(getSessionStart(b))}</p>
                        <p className="text-xs font-medium text-sunlo-text">Earned: ₹{b.companionEarnings || 0}</p>
                      </div>
                      <div className="text-right">
                        {b.rating ? (
                          <div className="flex items-center gap-1 text-sm font-semibold text-sunlo-accent">
                            <span>★</span>
                            <span>{b.rating}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-sunlo-muted">No rating</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-5 shadow-card">
              <div className="flex items-center gap-3">
                <Avatar
                  src={companion?.photoURL || companion?.photo}
                  name={companion?.name}
                  size={64}
                  className="border-2 border-sunlo-secondary"
                />
                <div>
                  <p className="font-semibold text-sunlo-text">{companion?.name || "Companion"}</p>
                  <p className="text-xs text-sunlo-muted">{companion?.bio?.slice(0, 60) || "No bio"}...</p>
                </div>
              </div>
              <Link href={`/companion/${user?.uid}`}>
                <Button variant="outline" className="mt-4 w-full">View Public Profile</Button>
              </Link>
              <Link href="/dashboard/companion/profile/edit">
                <Button variant="outline" className="mt-2 w-full">Edit Profile</Button>
              </Link>
              <div className="mt-6 border-t border-sunlo-secondary-light pt-6">
                <ProfilePhotoUploader
                  uid={user?.uid}
                  currentPhotoURL={companion?.photoURL || companion?.photo}
                  currentPhotoPath={companion?.photoPath}
                  fallbackName={companion?.name}
                  onUploadComplete={handlePhotoUpload}
                  onRemove={handlePhotoRemove}
                  size={120}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
