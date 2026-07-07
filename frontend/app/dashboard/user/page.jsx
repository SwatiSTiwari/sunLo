"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { getUserBookings } from "@/lib/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

export default function UserDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <UserDashboard />
    </ProtectedRoute>
  );
}

function UserDashboard() {
  const { user, userData } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      try {
        const data = await getUserBookings(user.uid);
        setBookings(data);
      } catch (err) {
        toast.error("Bookings load nahi ho payi");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const now = new Date();

  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.sessionEndTime) > now
  );
  const past = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.sessionEndTime) <= now
  );

  const totalSessions = past.length;
  const totalSpent = past.reduce((sum, b) => sum + (b.amount || 0), 0);

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

  const getDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const mins = Math.round((e - s) / 60000);
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen bg-sunlo-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-sunlo-text">
            Namaste, {userData?.name || "Friend"} 👋
          </h1>
          <p className="mt-1 text-sm text-sunlo-muted">Aapka dashboard</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-3xl bg-white p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-sunlo-text">{totalSessions}</p>
            <p className="text-xs text-sunlo-muted">Total Sessions</p>
          </div>
          <div className="rounded-3xl bg-white p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-sunlo-text">₹{totalSpent}</p>
            <p className="text-xs text-sunlo-muted">Total Spent</p>
          </div>
          <div className="rounded-3xl bg-white p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-sunlo-text">{upcoming.length}</p>
            <p className="text-xs text-sunlo-muted">Upcoming</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
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
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-orange-200">
                        {b.companionPhoto ? (
                          <Image
                            src={b.companionPhoto}
                            alt={b.companionName}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                            {(b.companionName || "C").charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-sunlo-text">{b.companionName || "Companion"}</p>
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
                <div className="py-6 text-center">
                  <p className="font-hindi text-base text-sunlo-muted">Abhi tak koi session nahi hua. Pehla session free hai! 🎉</p>
                  <Link href="/browse" className="mt-4 inline-block">
                    <Button>Companion dhoondhein</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {past.map((b) => (
                    <div key={b.bookingId} className="flex items-center gap-3 rounded-xl border border-orange-100 p-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-orange-200">
                        {b.companionPhoto ? (
                          <Image
                            src={b.companionPhoto}
                            alt={b.companionName}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                            {(b.companionName || "C").charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-sunlo-text">{b.companionName || "Companion"}</p>
                        <p className="text-xs text-sunlo-muted">{formatDate(b.sessionStartTime)} · {getDuration(b.sessionStartTime, b.sessionEndTime)}</p>
                        <p className="text-xs font-medium text-sunlo-text">₹{b.amount || 0}</p>
                      </div>
                      <Link href={`/book/${b.companionId}`}>
                        <Button variant="outline" className="px-3 py-2 text-xs">Fir se baat karo</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-sunlo-primary to-sunlo-accent p-5 text-white shadow-button">
              <h3 className="mb-2 font-semibold">Daily Check-in</h3>
              <p className="mb-4 text-sm text-white/90">How are you feeling today? Take a quick moment to reflect.</p>
              <Button variant="secondary" className="w-full text-sm">Check In</Button>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-card">
              <h3 className="mb-2 font-semibold text-sunlo-text">24/7 Crisis Support</h3>
              <p className="text-sm text-sunlo-muted">If you need immediate help, please reach out to a mental health professional.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
