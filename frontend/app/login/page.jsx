"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getUser } from "@/lib/firestore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { user, userData, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (user && userData) {
    if (userData.role === "companion") {
      router.push(userData.profileComplete ? "/dashboard/companion" : "/setup/companion");
    } else {
      router.push("/dashboard/user");
    }
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }
    setIsLoading(true);
    try {
      const cred = await login(email, password);
      const freshUser = await getUser(cred.user.uid);
      if (freshUser?.role === "companion") {
        router.push(freshUser.profileComplete ? "/dashboard/companion" : "/setup/companion");
      } else {
        router.push("/dashboard/user");
      }
    } catch (err) {
      toast.error(err?.message || "Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-sunlo-background">
      <header className="border-b border-orange-100 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/">
            <Logo className="h-7" />
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-sunlo-primary to-sunlo-accent px-5 py-2 text-sm font-semibold text-white shadow-button transition-all hover:from-sunlo-primary-dark hover:to-sunlo-primary"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-sunlo-text">Welcome Back</h1>
            <p className="mt-2 text-sm text-sunlo-muted">
              Sign in to continue your safe space journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-sunlo-muted">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-sunlo-primary hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
