"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/authContext";
import { getUser } from "@/lib/firestore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const role = searchParams.get("role");
  const isValidRole = role === "user" || role === "companion";

  if (user && userData) {
    if (userData.role === role) {
      if (userData.role === "companion") {
        router.push(userData.profileComplete ? "/dashboard/companion" : "/setup/companion");
      } else {
        router.push("/dashboard/user");
      }
    } else {
      signOut(auth);
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
      const lowerEmail = email.toLowerCase();
      const cred = await login(lowerEmail, password);
      const freshUser = await getUser(cred.user.uid);
      if (freshUser?.role !== role) {
        await signOut(auth);
        const actualRole = freshUser?.role || "user";
        toast.error(`This email is registered as a ${actualRole}. Please use the ${actualRole} login.`);
        setIsLoading(false);
        return;
      }
      if (freshUser.role === "companion") {
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
            href={isValidRole ? `/signup?role=${role}` : "/signup"}
            className="rounded-full bg-gradient-to-r from-sunlo-primary to-sunlo-accent px-5 py-2 text-sm font-semibold text-white shadow-button transition-all hover:from-sunlo-primary-dark hover:to-sunlo-primary"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-sunlo-text">
              {isValidRole ? `${role === "companion" ? "Companion" : "User"} Login` : "Choose account type to sign in"}
            </h1>
            <p className="mt-2 text-sm text-sunlo-muted">
              {isValidRole
                ? "Sign in to continue your safe space journey."
                : "Select how you registered to continue."}
            </p>
          </div>

          {isValidRole ? (
            <>
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
                  href={`/signup?role=${role}`}
                  className="font-semibold text-sunlo-primary hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <Link
                href="/login?role=user"
                className="block w-full rounded-2xl bg-gradient-to-r from-sunlo-primary to-sunlo-accent px-5 py-3 text-center font-semibold text-white shadow-button transition-all hover:from-sunlo-primary-dark hover:to-sunlo-primary"
              >
                User Login
              </Link>
              <Link
                href="/login?role=companion"
                className="block w-full rounded-2xl border-2 border-sunlo-primary px-5 py-3 text-center font-semibold text-sunlo-primary transition-all hover:bg-sunlo-primary hover:text-white"
              >
                Companion Login
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
