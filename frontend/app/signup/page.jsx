"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const { signup, createUserDoc } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("form");
  const [newUser, setNewUser] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsLoading(true);
    try {
      const cred = await signup(email, password);
      setNewUser(cred.user);
      setStep("role");
    } catch (err) {
      toast.error(err?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    if (!newUser) return;
    setIsLoading(true);
    try {
      await createUserDoc(newUser.uid, { email, role, name });
      toast.success("Account created!");
      if (role === "user") {
        router.push("/dashboard/user");
      } else {
        router.push("/setup/companion");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong.");
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
            href="/login"
            className="rounded-full bg-gradient-to-r from-sunlo-primary to-sunlo-accent px-5 py-2 text-sm font-semibold text-white shadow-button transition-all hover:from-sunlo-primary-dark hover:to-sunlo-primary"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card sm:p-10">
          {step === "form" ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-sunlo-text">Welcome Home</h1>
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
                  required
                />
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
                  href="/login"
                  className="font-semibold text-sunlo-primary hover:underline"
                >
                  Login
                </Link>
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <h2 className="text-center text-lg font-semibold text-sunlo-text">
                What brings you here?
              </h2>
              <button
                onClick={() => handleRoleSelect("user")}
                disabled={isLoading}
                className="w-full rounded-2xl border-2 border-orange-100 bg-sunlo-background p-6 text-left transition-all hover:border-sunlo-primary hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-sunlo-primary"
              >
                <span className="text-2xl">🫂</span>
                <p className="mt-2 text-base font-semibold text-sunlo-text">
                  I want to talk to someone
                </p>
                <p className="mt-1 text-sm text-sunlo-muted">
                  I’m looking for a listener
                </p>
              </button>
              <button
                onClick={() => handleRoleSelect("companion")}
                disabled={isLoading}
                className="w-full rounded-2xl border-2 border-orange-100 bg-sunlo-background p-6 text-left transition-all hover:border-sunlo-primary hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-sunlo-primary"
              >
                <span className="text-2xl">👂</span>
                <p className="mt-2 text-base font-semibold text-sunlo-text">
                  I want to listen to others
                </p>
                <p className="mt-1 text-sm text-sunlo-muted">
                  I’d like to become a companion
                </p>
              </button>
              {isLoading && (
                <div className="flex justify-center py-2">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sunlo-primary border-t-transparent" />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
