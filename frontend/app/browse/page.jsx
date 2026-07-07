"use client";

import { useState, useEffect } from "react";
import { getCompanions } from "@/lib/firestore";
import CompanionCard from "@/components/CompanionCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const languages = ["Hindi", "English", "Marathi", "Bengali", "Tamil", "Telugu", "Gujarati"];

export default function BrowsePage() {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("");
  const [available, setAvailable] = useState(false);
  const [minRating, setMinRating] = useState("");
  const [priceSort, setPriceSort] = useState("relevance");

  useEffect(() => {
    async function fetchCompanions() {
      setLoading(true);
      try {
        const filters = {};
        if (language) filters.language = language;
        if (available) filters.available = true;
        if (minRating) filters.minRating = Number(minRating);
        const data = await getCompanions(filters);
        let list = data;
        if (priceSort === "asc") {
          list = [...list].sort((a, b) => (a.pricePerSession || 99) - (b.pricePerSession || 99));
        } else if (priceSort === "desc") {
          list = [...list].sort((a, b) => (b.pricePerSession || 99) - (a.pricePerSession || 99));
        }
        setCompanions(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanions();
  }, [language, available, minRating, priceSort]);

  return (
    <div className="min-h-screen bg-sunlo-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-center font-hindi text-2xl font-bold text-sunlo-text sm:text-3xl">
          अपना सुनने वाला ढूंढो
        </h1>
        <p className="mb-8 text-center text-sm text-sunlo-muted">
          Find a companion who listens with empathy and heart.
        </p>

        {/* Filter Bar */}
        <div className="mb-8 rounded-3xl bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-sunlo-text">
                Language
              </label>
              <select
                className="w-full rounded-xl border border-orange-100 bg-sunlo-background px-3 py-2.5 text-sm text-sunlo-text focus:border-sunlo-primary focus:outline-none focus:ring-2 focus:ring-sunlo-secondary/50"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="">All</option>
                {languages.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <input
                id="available"
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-orange-200 text-sunlo-primary focus:ring-sunlo-secondary"
              />
              <label htmlFor="available" className="text-sm text-sunlo-text">
                Available now
              </label>
            </div>

            <div className="w-full sm:w-32">
              <label className="mb-1 block text-xs font-semibold text-sunlo-text">
                Rating
              </label>
              <select
                className="w-full rounded-xl border border-orange-100 bg-sunlo-background px-3 py-2.5 text-sm text-sunlo-text focus:border-sunlo-primary focus:outline-none focus:ring-2 focus:ring-sunlo-secondary/50"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">Any</option>
                <option value="4">4+</option>
                <option value="3">3+</option>
                <option value="5">5</option>
              </select>
            </div>

            <div className="w-full sm:w-40">
              <label className="mb-1 block text-xs font-semibold text-sunlo-text">
                Sort by
              </label>
              <select
                className="w-full rounded-xl border border-orange-100 bg-sunlo-background px-3 py-2.5 text-sm text-sunlo-text focus:border-sunlo-primary focus:outline-none focus:ring-2 focus:ring-sunlo-secondary/50"
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sunlo-primary border-t-transparent" />
          </div>
        )}

        {/* Empty State */}
        {!loading && companions.length === 0 && (
          <div className="rounded-3xl bg-white py-16 text-center shadow-card">
            <p className="mb-2 text-4xl">😔</p>
            <p className="text-lg font-medium text-sunlo-text">No companions found</p>
            <p className="text-sm text-sunlo-muted">Try adjusting your filters</p>
          </div>
        )}

        {/* Grid */}
        {!loading && companions.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companions.map((companion) => (
              <CompanionCard key={companion.uid} companion={companion} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
