"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Calendar, MessageCircle, Shield, Users, Wallet, Phone } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse",
    desc: "Pick a companion who matches your mood, language, and topic.",
  },
  {
    icon: Calendar,
    title: "Book",
    desc: "Select a session length and time that works for you.",
  },
  {
    icon: MessageCircle,
    title: "Chat",
    desc: "Connect privately with someone who truly listens.",
  },
];

const whyCards = [
  {
    icon: Shield,
    title: "Safe & Private",
    desc: "End-to-end encrypted conversations. No one else can hear your story.",
  },
  {
    icon: Users,
    title: "Real Humans",
    desc: "Verified companions who genuinely want to listen. No bots, no scripts.",
  },
  {
    icon: Wallet,
    title: "Affordable",
    desc: "Cheaper than therapy, better than being alone. Starting at just ₹49.",
  },
];

const pricingSessions = [
  { duration: "15 Minutes", price: "₹49", popular: false },
  { duration: "30 Minutes", price: "₹99", popular: true },
  { duration: "1 Hour", price: "₹179", popular: false },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-sunlo-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-sunlo-hero px-4 py-16 sm:py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="mb-4 text-6xl font-bold leading-tight text-sunlo-text sm:text-7xl">
              SunLo
            </h1>
            <p className="mb-2 text-xl font-medium text-sunlo-muted sm:text-2xl">
              Someone is listening, always
            </p>
            <p className="mb-8 text-sm text-sunlo-muted/80 sm:text-base">
              Find a companion to talk to, anonymously. Share your thoughts, feelings,
              and everyday worries without judgment.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/signup?role=user"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sunlo-primary to-sunlo-accent px-8 py-3 font-semibold text-white shadow-button transition-all hover:from-sunlo-primary-dark hover:to-sunlo-primary"
              >
                Find a Companion
              </Link>
              <Link
                href="/signup?role=companion"
                className="inline-flex items-center justify-center rounded-full border-2 border-sunlo-primary bg-white px-8 py-3 font-semibold text-sunlo-primary transition-all hover:bg-sunlo-primary hover:text-white"
              >
                Become a Listener
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-sunlo-secondary to-sunlo-accent text-xs font-bold text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-xs text-sunlo-muted">
                <span className="font-semibold text-sunlo-text">10,000+</span> companions joined this week
              </p>
            </div>
          </div>

          <div className="w-full max-w-md lg:w-auto">
            <div className="relative rounded-3xl border border-orange-100 bg-white p-5 shadow-card">
              <div className="mb-4 flex items-center gap-3 border-b border-orange-50 pb-4">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-orange-100">
                  <div className="flex h-full w-full items-center justify-center text-lg">👩</div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-sunlo-text">Ananya Sharma</p>
                  <p className="text-xs text-sunlo-muted">Online now</p>
                </div>
                <span className="ml-auto rounded-full bg-sunlo-success/10 px-2 py-0.5 text-xs font-medium text-sunlo-success">
                  Available
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl rounded-tl-none bg-sunlo-secondary-light p-3">
                  <p className="text-sm text-sunlo-text">
                    Hi! I’m Ananya. How are you feeling today? 😊
                  </p>
                </div>
                <div className="rounded-2xl rounded-tr-none bg-sunlo-primary p-3 text-white">
                  <p className="text-sm">I’ve been feeling a bit low lately. Work stress is too much.</p>
                </div>
                <div className="rounded-2xl rounded-tl-none bg-sunlo-secondary-light p-3">
                  <p className="text-sm text-sunlo-text">
                    I understand. Talking about it can help. I’m here to listen. 💛
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-full border border-orange-100 bg-sunlo-background px-4 py-2.5 text-sm text-sunlo-muted">
                Type a message...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crisis Disclaimer */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-4">
        <div className="rounded-3xl border border-red-100 bg-red-50/50 p-6 shadow-soft sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sunlo-text sm:text-xl">
                Not a crisis or therapy service
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-sunlo-muted">
                SunLo is a safe space for everyday conversations and emotional support.
                It is not a substitute for professional mental health care, therapy, or emergency services.
                If you are experiencing a serious mental health condition, suicidal thoughts, or any emergency,
                please reach out to a qualified mental health professional immediately.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <a
                  href="tel:14416"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-red-600 shadow-sm transition-all hover:bg-red-100"
                >
                  <Phone className="h-4 w-4" />
                  Tele MANAS: 14416
                </a>
                <a
                  href="tel:08046110007"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-red-600 shadow-sm transition-all hover:bg-red-100"
                >
                  <Phone className="h-4 w-4" />
                  NIMHANS: 080-4611-0007
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="mb-12 text-center text-2xl font-bold text-sunlo-text sm:text-3xl">
          3 Steps to Feel Better
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white p-6 text-center shadow-card transition-all hover:shadow-soft"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sunlo-secondary text-sunlo-text">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-sunlo-text">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-sunlo-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why SunLo */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 lg:flex-row">
          <div className="flex-1">
            <h2 className="mb-4 text-2xl font-bold text-sunlo-text sm:text-3xl">
              Cheaper than therapy, better than being alone
            </h2>
            <p className="mb-8 text-sunlo-muted">
              SunLo bridges the gap between expensive therapy and feeling alone.
              Talk to a real, empathetic companion whenever you need it.
            </p>

            <div className="space-y-5">
              {whyCards.map((card, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sunlo-secondary text-sunlo-text">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sunlo-text">{card.title}</h3>
                    <p className="text-sm text-sunlo-muted">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100 to-sunlo-secondary shadow-card">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🧘</div>
                  <p className="text-lg font-medium text-sunlo-text">Peace, just a conversation away</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="mb-2 text-center text-2xl font-bold text-sunlo-text sm:text-3xl">
          Simple, Per-Session Pricing
        </h2>
        <p className="mb-10 text-center text-sunlo-muted">
          No subscriptions. Pay only when you talk.
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          {pricingSessions.map((p, i) => (
            <div
              key={i}
              className={`relative rounded-3xl p-6 text-center shadow-card transition-all hover:shadow-soft ${
                p.popular
                  ? "border-2 border-sunlo-primary bg-white"
                  : "border border-orange-100 bg-white"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sunlo-primary to-sunlo-accent px-3 py-1 text-xs font-semibold text-white shadow-button">
                  Most Popular
                </span>
              )}
              <p className="mb-2 text-sm text-sunlo-muted">{p.duration}</p>
              <p className="mb-6 text-4xl font-bold text-sunlo-text">{p.price}</p>
              <Link
                href="/browse"
                className={`block w-full rounded-full py-2.5 text-sm font-semibold transition-all ${
                  p.popular
                    ? "bg-gradient-to-r from-sunlo-primary to-sunlo-accent text-white shadow-button hover:from-sunlo-primary-dark hover:to-sunlo-primary"
                    : "border-2 border-sunlo-primary text-sunlo-primary hover:bg-sunlo-primary hover:text-white"
                }`}
              >
                Start Chat
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
        <div className="rounded-3xl bg-sunlo-gradient p-10 text-center text-white shadow-button sm:p-14">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">Ready to be heard?</h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-white/90">
            Join thousands of others who found peace in sharing their story. Your
            companion is waiting.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 font-semibold text-sunlo-primary shadow-card transition-all hover:bg-white/90"
          >
            Find a Companion
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
