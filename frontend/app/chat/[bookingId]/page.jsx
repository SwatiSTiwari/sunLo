"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getBooking, updateBooking, getUser, getCompanion, createReview, createReport, subscribeToBooking } from "@/lib/firestore";
import { sendMessage, subscribeToMessages, setTyping, subscribeToTyping } from "@/lib/chat";
import Button from "@/components/ui/Button";
import LinkifyText from "@/components/LinkifyText";
import Avatar from "@/components/Avatar";
import { toast } from "react-hot-toast";

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getSessionState(booking) {
  let startMs = null;
  let endMs = null;

  if (booking?.sessionStartTime) {
    startMs = new Date(booking.sessionStartTime).getTime();
  }
  if (booking?.sessionEndTime) {
    endMs = new Date(booking.sessionEndTime).getTime();
  }

  // Fallback for bookings generated before stored timestamps were added
  if ((!startMs || Number.isNaN(startMs)) && booking?.meetLink) {
    startMs = booking.createdAt ? new Date(booking.createdAt).getTime() : Date.now();
  }
  if (startMs && (!endMs || Number.isNaN(endMs))) {
    endMs = startMs + (booking.duration || 15) * 60 * 1000;
  }

  if (!startMs || Number.isNaN(startMs) || !endMs || Number.isNaN(endMs)) {
    return { phase: "waiting", timeLeft: 0, startMs, endMs };
  }

  const now = Date.now();
  if (now < startMs) {
    return { phase: "scheduled", timeLeft: startMs - now, startMs, endMs };
  }
  if (now >= endMs) {
    return { phase: "completed", timeLeft: 0, startMs, endMs };
  }
  return { phase: "active", timeLeft: endMs - now, startMs, endMs };
}

export default function ChatPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId;

  const [booking, setBooking] = useState(null);
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingMap, setTypingMap] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState("waiting");
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const hasEndedRef = useRef(false);

  // Access control and initial data fetch
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const b = await getBooking(bookingId);
        if (!b) {
          toast.error("Booking not found");
          router.replace("/dashboard/user");
          return;
        }
        const isBooker = b.userId === user.uid;
        const isCompanion = b.companionId === user.uid;
        if (!isBooker && !isCompanion) {
          toast.error("You cannot access this chat");
          router.replace("/dashboard/user");
          return;
        }
        if (b.status !== "confirmed" && b.status !== "completed") {
          toast.error("Booking is not confirmed. Please complete payment first.");
          router.replace("/dashboard/user");
          return;
        }
        setBooking(b);

        if (userData?.suspended) {
          toast.error("Your account has been suspended.");
          router.replace("/dashboard/user");
          return;
        }

        const otherId = isBooker ? b.companionId : b.userId;
        const otherData = isBooker ? await getCompanion(otherId) : await getUser(otherId);
        if (otherData?.suspended) {
          toast.error("This account is no longer available.");
          router.replace("/dashboard/user");
          return;
        }
        setOther(otherData);

        const state = getSessionState(b);
        setPhase(state.phase);
        setTimeLeft(state.timeLeft);
        if (state.phase === "completed") {
          setSessionEnded(true);
          setShowRating(true);
        }
      } catch (e) {
        console.error("Chat page load error:", e);
        toast.error(e.message || "Something went wrong");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [user, authLoading, bookingId, router, userData]);

  // Subscribe to booking updates so timer stays in sync with stored start/end times
  useEffect(() => {
    if (!bookingId) return;
    const unsub = subscribeToBooking(bookingId, (updated) => {
      if (!updated) return;
      setBooking((prev) => (prev ? { ...prev, ...updated } : updated));
      const state = getSessionState(updated);
      setPhase(state.phase);
      setTimeLeft(state.timeLeft);
      if (state.phase === "completed" && !sessionEnded) {
        setSessionEnded(true);
        setShowRating(true);
      }
    });
    return () => unsub();
  }, [bookingId, sessionEnded]);

  // Subscribe to messages
  useEffect(() => {
    if (!bookingId) return;
    const unsub = subscribeToMessages(bookingId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, [bookingId]);

  // Subscribe to typing
  useEffect(() => {
    if (!bookingId) return;
    const unsub = subscribeToTyping(bookingId, (map) => {
      setTypingMap(map || {});
    });
    return () => unsub();
  }, [bookingId]);

  // Timer countdown
  useEffect(() => {
    if (phase === "completed" || phase === "waiting") return;
    timerRef.current = setInterval(() => {
      if (!booking) return;
      const state = getSessionState(booking);
      setPhase(state.phase);
      setTimeLeft(state.timeLeft);
      if (state.phase === "completed") {
        clearInterval(timerRef.current);
        setSessionEnded(true);
        setShowRating(true);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, booking]);

  // Mark session complete when timer ends
  useEffect(() => {
    if (sessionEnded && bookingId && !hasEndedRef.current) {
      hasEndedRef.current = true;
      const now = new Date().toISOString();
      updateBooking(bookingId, { sessionEndTime: now, status: "completed" }).catch((e) =>
        console.error("Failed to mark session complete", e)
      );
    }
  }, [sessionEnded, bookingId]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingMap]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || !user || !booking) return;
    setSending(true);
    try {
      await sendMessage(bookingId, {
        senderId: user.uid,
        senderName: userData?.name || user.displayName || "User",
        text: text.trim(),
      });
      setText("");
      inputRef.current?.focus();
    } catch (e) {
      console.error("sendMessage error:", e);
      toast.error(e.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }, [text, user, userData, booking, bookingId]);

  const handleTyping = () => {
    const key = user?.uid || "user";
    setTyping(bookingId, key, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(bookingId, key, false);
    }, 1500);
  };

  const handleRatingSubmit = async () => {
    if (!booking || !user) return;
    try {
      await createReview({
        bookingId,
        companionId: booking.companionId,
        userId: user.uid,
        rating,
        text: reviewText,
      });
      await updateBooking(bookingId, { status: "completed" });
      toast.success("Review submitted, thank you!");
      router.push("/dashboard/user");
    } catch (e) {
      toast.error("Review could not be saved");
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim() || !booking || !user) return;
    try {
      const reportedUser = booking.userId === user.uid ? booking.companionId : booking.userId;
      await createReport({
        bookingId,
        reportedBy: user.uid,
        reportedUser,
        reason: reportReason.trim(),
      });
      setShowReport(false);
      setReportReason("");
      toast.success("Report submitted. We will take action soon.");
    } catch (e) {
      toast.error("Failed to send report");
    }
  };

  const isBooker = booking?.userId === user?.uid;
  const otherName = other?.name || (isBooker ? booking?.companionName : booking?.userName) || "Companion";
  const otherPhoto = other?.photoURL || other?.photo || (isBooker ? booking?.companionPhoto : booking?.userPhoto);
  const otherTypingKey = other?.uid || "other";
  const isOtherTyping = typingMap[otherTypingKey] === true;

  function timerBadgeClass() {
    if (phase === "completed") return "bg-gray-100 text-gray-500";
    if (phase === "scheduled") return "bg-blue-100 text-blue-700";
    if (timeLeft <= 60000) return "bg-red-100 text-red-600";
    return "bg-orange-100 text-sunlo-primary";
  }

  function timerBadgeText() {
    if (phase === "completed") return "Ended";
    if (phase === "scheduled") return `Starts in ${formatTime(timeLeft)}`;
    if (phase === "waiting") return "Waiting";
    return formatTime(timeLeft);
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
    <main className="flex h-screen flex-col bg-sunlo-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-orange-100 bg-white px-4 py-3 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 text-sunlo-muted hover:bg-orange-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="relative">
            <Avatar
              src={otherPhoto}
              name={otherName}
              size={40}
              isOnline
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-sunlo-text">{otherName}</h2>
            <p className="text-xs text-sunlo-muted">
              {phase === "active" ? "In session" : phase === "scheduled" ? "Session scheduled" : phase === "completed" ? "Session ended" : "Waiting to start"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${timerBadgeClass()}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {timerBadgeText()}
          </div>
          <button
            onClick={() => setShowReport(true)}
            className="rounded-full p-2 text-lg text-red-500 hover:bg-red-50"
            title="Report"
          >
            ⚠️
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 ${sessionEnded ? "blur-sm" : ""}`}>
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-orange-300">
            <p className="mb-1">Send the first message here 👋</p>
            <p>Start talking to your companion</p>
          </div>
        )}
        <div className="space-y-4">
          {messages.length > 0 && (
            <div className="flex justify-center">
              <span className="rounded-full bg-white px-3 py-1 text-xs text-sunlo-muted shadow-sm">Today</span>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${isMe ? "rounded-tr-none bg-gradient-to-br from-sunlo-primary to-sunlo-accent text-white" : "rounded-tl-none bg-sunlo-secondary-light text-sunlo-text"}`}>
                  <p><LinkifyText text={msg.text} /></p>
                  <p className={`mt-1 text-[10px] ${isMe ? "text-white/80" : "text-sunlo-muted"}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </p>
                </div>
              </div>
            );
          })}
          {isOtherTyping && (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl rounded-tl-none bg-sunlo-secondary-light px-4 py-2.5 text-sm text-sunlo-text shadow-soft">
                <span className="inline-flex items-center gap-1">
                  {otherName} typing
                  <span className="inline-flex gap-0.5">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-sunlo-muted" style={{ animationDelay: "0ms" }} />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-sunlo-muted" style={{ animationDelay: "150ms" }} />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-sunlo-muted" style={{ animationDelay: "300ms" }} />
                  </span>
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      {!sessionEnded && (
        <div className="border-t border-orange-100 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <button className="rounded-full p-2 text-sunlo-muted hover:bg-orange-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type here..."
              className="flex-1 rounded-full border border-orange-100 bg-sunlo-background px-4 py-2.5 text-sm text-sunlo-text placeholder-sunlo-muted/60 shadow-sm transition-all focus:border-sunlo-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunlo-secondary/50"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-sunlo-primary to-sunlo-accent text-white shadow-button transition-all hover:from-sunlo-primary-dark hover:to-sunlo-primary disabled:opacity-50"
            >
              {sending ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Session End Modal */}
      {sessionEnded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mb-3 text-4xl">🙏</div>
            <h3 className="mb-2 text-lg font-bold text-sunlo-text">Your session has ended</h3>
            <p className="mb-6 text-sm text-sunlo-muted">Your time is up. Please leave a review.</p>
            <Button onClick={() => setShowRating(true)} className="w-full">
              Leave Review
            </Button>
            <button
              onClick={() => setShowReport(true)}
              className="mt-4 text-sm text-red-500 hover:underline"
            >
              Report issue
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-center text-lg font-bold text-sunlo-text">How was your session?</h3>
            <div className="mb-4 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-transform ${star <= rating ? "scale-110 text-yellow-400" : "text-orange-200"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Anything you would like to share?"
              className="mb-4 w-full rounded-2xl border border-orange-100 bg-sunlo-background px-4 py-3 text-sm text-sunlo-text placeholder-sunlo-muted/60 shadow-sm focus:border-sunlo-primary focus:outline-none focus:ring-2 focus:ring-sunlo-secondary/50"
              rows={3}
            />
            <Button
              onClick={handleRatingSubmit}
              disabled={rating === 0}
              className="w-full"
            >
              Submit Review
            </Button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-center text-lg font-bold text-sunlo-text">Report</h3>
            <p className="mb-4 text-center text-sm text-sunlo-muted">What problem did you face? Let us know.</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Write the reason..."
              className="mb-4 w-full rounded-2xl border border-orange-100 bg-sunlo-background px-4 py-3 text-sm text-sunlo-text placeholder-sunlo-muted/60 shadow-sm focus:border-sunlo-primary focus:outline-none focus:ring-2 focus:ring-sunlo-secondary/50"
              rows={3}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowReport(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleReportSubmit}
                disabled={!reportReason.trim()}
                className="flex-1"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
