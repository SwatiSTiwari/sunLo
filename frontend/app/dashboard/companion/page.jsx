"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { getCompanionBookings, updateCompanion, getCompanion } from "@/lib/firestore";
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
        toast.error("Data load nahi ho paya");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const now = new Date();

  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.sessionEndTime) > now
  );
  const past = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.sessionEndTime) <= now
  );

  const totalEarned = past.reduce((sum, b) => sum + (b.companionEarnings || 0), 0);
  const thisMonth = past.filter((b) => {
    const d = new Date(b.sessionEndTime);
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
      toast.success(next ? "Ab aap available hain" : "Ab aap unavailable hain");
    } catch (err) {
      toast.error("Update nahi ho paya");
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-sunlo-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sunlo-text">Namaste, {userData?.name || "Friend"} 👋</h1>
            <p className="mt-1 text-sm text-sunlo-muted">Aapka companion dashboard</p>
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
              <p className="mt-3 text-xs text-sunlo-muted">Platform fee deduct hone ke baad amount show ho raha hai.</p>
            </div>

            <div className="mb-6 rounded-3xl bg-white p-5 shadow-card">
              <h2 className="mb-3 text-lg font-bold text-sunlo-text">Upcoming Sessions</h2>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sunlo-primary border-t-transparent" />
                </div>
              ) : upcoming.length === 0 ? (
                <p className="py-4 text-center text-sm text-sunlo-muted">Koi upcoming session nahi hai</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((b) => (
                    <div key={b.bookingId} className="flex items-center gap-3 rounded-xl bg-sunlo-secondary-light p-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-sunlo-text">{b.userName || "User"}</p>
                        <p className="text-xs text-sunlo-muted">{formatDate(b.sessionStartTime)}</p>
                      </div>
                      <span className="rounded-full bg-sunlo-success/10 px-3 py-1 text-xs font-medium text-sunlo-success">Confirmed</span>
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
                <p className="py-4 text-center text-sm text-sunlo-muted">Abhi tak koi session complete nahi hua</p>
              ) : (
                <div className="space-y-3">
                  {past.map((b) => (
                    <div key={b.bookingId} className="flex items-center gap-3 rounded-xl border border-orange-100 p-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-sunlo-text">{b.userName || "User"}</p>
                        <p className="text-xs text-sunlo-muted">{formatDate(b.sessionStartTime)}</p>
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
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-sunlo-secondary">
                  {companion?.photoURL ? (
                    <Image src={companion.photoURL} alt={companion.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-orange-100 text-xl font-bold text-sunlo-primary">
                      {(companion?.name || "C").charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sunlo-text">{companion?.name || "Companion"}</p>
                  <p className="text-xs text-sunlo-muted">{companion?.bio?.slice(0, 60) || "No bio"}...</p>
                </div>
              </div>
              <Link href={`/companion/${user?.uid}`}>
                <Button variant="outline" className="mt-4 w-full">View Public Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
