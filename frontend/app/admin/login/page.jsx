"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/lib/authContext";
import { auth, db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const userCredential = await login(email, password);
      const uid = userCredential.user.uid;
      const snap = await getDoc(doc(db, "users", uid));
      const data = snap.exists ? snap.data() : null;
      if (data?.role !== "admin") {
        await signOut(auth);
        toast.error("You are not authorized to access the admin panel.");
        return;
      }
      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sunlo-background px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-card">
        <h1 className="mb-6 text-center text-2xl font-bold text-sunlo-text">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-orange-100 bg-sunlo-background px-4 py-3 text-sm text-sunlo-text placeholder-sunlo-muted/60 focus:border-sunlo-primary focus:outline-none focus:ring-2 focus:ring-sunlo-secondary/50"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-orange-100 bg-sunlo-background px-4 py-3 text-sm text-sunlo-text placeholder-sunlo-muted/60 focus:border-sunlo-primary focus:outline-none focus:ring-2 focus:ring-sunlo-secondary/50"
            required
          />
          <Button type="submit" isLoading={loading} className="w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
