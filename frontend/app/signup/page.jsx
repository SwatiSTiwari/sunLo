"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getUserByEmail } from "@/lib/firestore";
import { isValidEmail, getPasswordErrors } from "@/lib/validation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, createUserDoc, user, userData, loading } = useAuth();

  const rawRole = searchParams.get("role");
  const role = rawRole === "user" || rawRole === "companion" ? rawRole : null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (loading) return;
    if (user && userData) {
      if (userData.role === "companion") {
        router.push(userData.profileComplete ? "/dashboard/companion" : "/setup/companion");
      } else if (userData.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard/user");
      }
    }
  }, [user, userData, loading, router]);

  if (loading || (user && userData)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sunlo-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sunlo-primary border-t-transparent" />
      </div>
    );
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!normalizedEmail) newErrors.email = "Email is required";
    else if (!isValidEmail(normalizedEmail)) newErrors.email = "Please enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    else {
      const pwdErrors = getPasswordErrors(password);
      if (pwdErrors.length) {
        newErrors.password = `Password must contain: ${pwdErrors.join(", ")}`;
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      let existingUser = null;
      try {
        existingUser = await getUserByEmail(normalizedEmail);
      } catch (lookupErr) {
        console.error("getUserByEmail failed:", lookupErr.code, lookupErr.message);
        throw lookupErr;
      }
      if (existingUser && existingUser.role === role) {
        toast.error("An account with this email already exists. Please log in.");
        setIsLoading(false);
        return;
      }

      const cred = await signup(normalizedEmail, password);
      await cred.user.getIdToken(true);
      try {
        await createUserDoc(cred.user.uid, {
          email: normalizedEmail,
          role,
          name,
        });
      } catch (docErr) {
        console.error("createUserDoc failed:", docErr.code, docErr.message);
        throw docErr;
      }

      toast.success("Account created!");
      if (role === "user") {
        router.push("/dashboard/user");
      } else {
        router.push("/setup/companion");
      }
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        try {
          const existing = await getUserByEmail(normalizedEmail);
          if (existing) {
            toast.error(
              `This email is already registered as a ${existing.role}. Please use the ${existing.role} login or use a different email.`
            );
          } else {
            toast.error(err?.message || "Signup failed. Please try again.");
          }
        } catch {
          toast.error(err?.message || "Signup failed. Please try again.");
        }
      } else {
        toast.error(err?.message || "Signup failed. Please try again.");
      }
    } finally {
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
            href={role ? `/login?role=${role}` : "/login"}
            className="rounded-full bg-gradient-to-r from-sunlo-primary to-sunlo-accent px-5 py-2 text-sm font-semibold text-white shadow-button transition-all hover:from-sunlo-primary-dark hover:to-sunlo-primary"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card sm:p-10">
          {!role ? (
            <div className="space-y-4">
              <h2 className="text-center text-lg font-semibold text-sunlo-text">
                Choose account type
              </h2>
              <Link
                href="/signup?role=user"
                className="block w-full rounded-2xl border-2 border-orange-100 bg-sunlo-background p-6 text-left transition-all hover:border-sunlo-primary hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-sunlo-primary"
              >
                <span className="text-2xl">🫂</span>
                <p className="mt-2 text-base font-semibold text-sunlo-text">
                  I want to talk to someone
                </p>
                <p className="mt-1 text-sm text-sunlo-muted">
                  I’m looking for a listener
                </p>
              </Link>
              <Link
                href="/signup?role=companion"
                className="block w-full rounded-2xl border-2 border-orange-100 bg-sunlo-background p-6 text-left transition-all hover:border-sunlo-primary hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-sunlo-primary"
              >
                <span className="text-2xl">👂</span>
                <p className="mt-2 text-base font-semibold text-sunlo-text">
                  I want to listen to others
                </p>
                <p className="mt-1 text-sm text-sunlo-muted">
                  I’d like to become a companion
                </p>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-sunlo-text">
                  Create a {role === "companion" ? "Companion" : "User"} account
                </h1>
                <p className="mt-2 text-sm text-sunlo-muted">
                  Create your safe space account and start connecting today.
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                />
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-sunlo-muted">
                Already have an account?{" "}
                <Link
                  href={`/login?role=${role}`}
                  className="font-semibold text-sunlo-primary hover:underline"
                >
                  Login
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
