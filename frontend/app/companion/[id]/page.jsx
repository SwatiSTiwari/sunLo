"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCompanion, getCompanionReviews } from "@/lib/firestore";
import { useAuth } from "@/lib/authContext";
import Navbar from "@/components/Navbar";

const durations = [
  { label: "15 mins", price: 49, value: "15" },
  { label: "30 mins", price: 99, value: "30" },
  { label: "1 hour", price: 179, value: "60" },
];

function StarRating({ rating }) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {half && (
        <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} className="h-4 w-4 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function CompanionDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { userData } = useAuth();
  const [companion, setCompanion] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState("30");
  const isCompanion = userData?.role === "companion";

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      setLoading(true);
      try {
        const cData = await getCompanion(id);
        setCompanion(cData);
      } catch (e) {
        console.error("Failed to load companion", e);
      }

      try {
        const rData = await getCompanionReviews(id);
        setReviews(rData || []);
      } catch (e) {
        console.error("Failed to load reviews", e);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  return (
    <main className="min-h-screen bg-sunlo-background">
      <Navbar />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sunlo-primary border-t-transparent" />
        </div>
      )}

      {!loading && !companion && (
        <div className="py-20 text-center">
          <p className="text-lg text-sunlo-text">Companion not found</p>
        </div>
      )}

      {!loading && companion && (
        <>
          <div className="relative h-48 bg-gradient-to-br from-sunlo-primary via-sunlo-accent to-sunlo-secondary sm:h-56" />

          <div className="mx-auto max-w-6xl px-4 pb-16">
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="flex-1">
                <div className="relative -mt-16 mb-4 flex justify-center lg:justify-start">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-card">
                    {companion.photo ? (
                      <Image
                        src={companion.photo}
                        alt={companion.name || "Companion"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-orange-100 text-3xl font-bold text-sunlo-primary">
                        {(companion.name || "?")[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6 text-center lg:text-left">
                  <div className="mb-1 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    <h1 className="text-2xl font-bold text-sunlo-text">
                      {companion.name || "Unnamed"}
                      {companion.age && `, ${companion.age}`}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </span>
                  </div>

                  <p className="mb-3 text-sm leading-relaxed text-sunlo-muted">
                    {companion.bio || "No bio available"}
                  </p>

                  <div className="mb-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    {companion.languages?.map((lang) => (
                      <span
                        key={lang}
                        className="rounded-full bg-sunlo-secondary-light px-3 py-1 text-xs font-medium text-sunlo-text"
                      >
                        {lang}
                      </span>
                    )) || (
                      <span className="rounded-full bg-sunlo-secondary-light px-3 py-1 text-xs font-medium text-sunlo-text">Hindi</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                    <div className="flex items-center gap-1">
                      <StarRating rating={companion.rating || 0} />
                      <span className="text-sm font-medium text-sunlo-text">
                        {companion.rating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    <span className="text-sm text-sunlo-muted">
                      {companion.totalSessions || 0} sessions
                    </span>
                  </div>
                </div>

                {companion.topics && companion.topics.length > 0 && (
                  <div className="mb-6">
                    <h2 className="mb-2 text-sm font-semibold text-sunlo-text">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {companion.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-xl border border-orange-100 bg-white px-3 py-1 text-xs font-medium text-sunlo-text"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-10">
                  <h2 className="mb-4 text-lg font-bold text-sunlo-text">Reviews</h2>
                  {reviews.length === 0 && (
                    <p className="text-sm text-sunlo-muted">No reviews yet. Be the first!</p>
                  )}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.reviewId} className="rounded-2xl bg-white p-4 shadow-soft">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-sunlo-primary">
                              {(review.userName || "U")[0]}
                            </div>
                            <span className="text-sm font-medium text-sunlo-text">{review.userName || "User"}</span>
                          </div>
                          <StarRating rating={review.rating || 0} />
                        </div>
                        <p className="text-sm leading-relaxed text-sunlo-muted">{review.comment || ""}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!isCompanion && (
                <div className="lg:w-80">
                  <div className="lg:sticky lg:top-24">
                    <div className="rounded-3xl bg-white p-5 shadow-card">
                      <h3 className="mb-4 text-lg font-semibold text-sunlo-text">Book a session</h3>
                      <div className="mb-4 space-y-2">
                        {durations.map((d) => (
                          <button
                            key={d.value}
                            onClick={() => setSelectedDuration(d.value)}
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
                              selectedDuration === d.value
                                ? "border-sunlo-primary bg-sunlo-secondary-light text-sunlo-primary"
                                : "border-orange-100 bg-white text-sunlo-text hover:border-orange-200"
                            }`}
                          >
                            <span className="font-medium">{d.label}</span>
                            <span className="font-bold">₹{d.price}</span>
                          </button>
                        ))}
                      </div>
                      <Link
                        href={`/book/${id}?duration=${selectedDuration}`}
                        className="block w-full rounded-xl bg-gradient-to-r from-sunlo-primary to-sunlo-accent py-3 text-center font-semibold text-white shadow-button transition-all hover:from-sunlo-primary-dark hover:to-sunlo-primary"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
