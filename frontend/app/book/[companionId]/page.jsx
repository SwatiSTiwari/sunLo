"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getCompanion, createBooking, getUserBookings } from "@/lib/firestore";
import { DURATIONS, calculateBreakdown } from "@/lib/constants";
import { loadRazorpay, openRazorpayModal } from "@/lib/razorpay";
import Button from "@/components/ui/Button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";

export default function BookPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companionId = params.companionId;

  const [companion, setCompanion] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [isPaying, setIsPaying] = useState(false);
  const [hasBookedBefore, setHasBookedBefore] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const [cData, bookings] = await Promise.all([
          getCompanion(companionId),
          getUserBookings(user.uid),
        ]);
        if (!cData) {
          toast.error("Companion nahi mila");
          router.replace("/browse");
          return;
        }
        setCompanion(cData);
        setHasBookedBefore(bookings.length > 0);
      } catch (e) {
        toast.error("Kuch galat ho gaya, phir se try karo");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [user, authLoading, companionId, router]);

  const isFirstSessionFree = !hasBookedBefore && selectedDuration === 15;
  const { amount, companionEarnings, platformFee } = calculateBreakdown(selectedDuration);

  async function handlePay() {
    if (!user || !companion) return;
    setIsPaying(true);

    try {
      const bookingId = await createBooking({
        userId: user.uid,
        companionId,
        duration: selectedDuration,
        amount,
        companionEarnings,
        platformFee,
        status: isFirstSessionFree ? "confirmed" : "pending",
      });

      if (isFirstSessionFree) {
        toast.success("Pehla session free! Ab chat shuru karo 🎉");
        router.push(`/chat/${bookingId}`);
        return;
      }

      const res = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          bookingId,
          notes: { userId: user.uid, companionId },
        }),
      });
      const order = await res.json();
      if (!res.ok || !order.id) {
        throw new Error(order.error || "Order create nahi hua");
      }

      const rzpLoaded = await loadRazorpay();
      if (!rzpLoaded) {
        throw new Error("Razorpay load nahi hua. Internet check karo.");
      }

      openRazorpayModal({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "SunLo",
        description: `Session with ${companion.name || "Companion"}`,
        order_id: order.id,
        prefill: {
          name: userData?.name || user.displayName || "",
          email: user.email || "",
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success("Payment successful! Ab chat shuru karo 🎉");
              router.push(`/chat/${bookingId}`);
            } else {
              toast.error(verifyData.error || "Payment verify nahi hua");
            }
          } catch (e) {
            toast.error("Payment verify mein error aayi");
          }
        },
        modal: {
          ondismiss: () => {
            toast("Payment cancel ho gaya", { icon: "ℹ️" });
          },
        },
      });
    } catch (err) {
      toast.error(err.message || "Payment start nahi hua");
    } finally {
      setIsPaying(false);
    }
  }

  if (authLoading || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sunlo-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sunlo-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-sunlo-background">
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-6">
        {/* Companion Mini Card */}
        <div className="mb-6 flex items-center gap-4 rounded-3xl bg-white p-4 shadow-soft">
          <div className="h-14 w-14 overflow-hidden rounded-full bg-orange-100">
            {companion?.photoURL ? (
              <img
                src={companion.photoURL}
                alt={companion.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-sunlo-primary">
                {(companion?.name || "C").charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sunlo-text">{companion?.name || "Companion"}</h2>
            <p className="text-sm text-sunlo-muted">{companion?.bio?.slice(0, 60) || "Aapka SunLo companion"}</p>
          </div>
        </div>

        {/* Duration Selector */}
        <div className="mb-6">
          <h3 className="mb-3 text-base font-semibold text-sunlo-text">Session kitni der ka?</h3>
          <div className="flex flex-wrap gap-3">
            {DURATIONS.map((d) => {
              const active = selectedDuration === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => setSelectedDuration(d.value)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold shadow-soft transition-all ${
                    active
                      ? "bg-gradient-to-r from-sunlo-primary to-sunlo-accent text-white shadow-button"
                      : "bg-white text-sunlo-text hover:bg-sunlo-secondary-light"
                  }`}
                >
                  {d.label} — ₹{d.price}
                </button>
              );
            })}
          </div>
        </div>

        {/* First Session Free Banner */}
        {isFirstSessionFree && (
          <div className="mb-6 rounded-3xl bg-sunlo-secondary p-4 text-center text-sm font-semibold text-sunlo-text shadow-soft">
            Pehla session free! 🎉 Aapka 15 min ka session bilkul free hai.
          </div>
        )}

        {/* Price Breakdown */}
        <div className="mb-8 rounded-3xl bg-white p-5 shadow-soft">
          <h3 className="mb-4 text-base font-semibold text-sunlo-text">Price breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-sunlo-text">
              <span>Session price</span>
              <span className="font-medium">₹{amount}</span>
            </div>
            <div className="flex justify-between text-sunlo-text">
              <span>Companion ko milega</span>
              <span className="font-medium text-sunlo-success">₹{companionEarnings}</span>
            </div>
            <div className="flex justify-between text-sunlo-text">
              <span>Platform fee</span>
              <span className="font-medium">₹{platformFee}</span>
            </div>
            <div className="flex justify-between border-t border-orange-100 pt-3 text-base font-bold text-sunlo-text">
              <span>Total</span>
              <span>₹{amount}</span>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <Button onClick={handlePay} isLoading={isPaying} className="w-full">
          {isFirstSessionFree ? "Free Session Shuru Karo" : "Razorpay se Pay Karo"}
        </Button>
      </main>
      <Footer />
    </div>
  );
}
