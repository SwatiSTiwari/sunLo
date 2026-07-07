"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles.length > 0 && userData?.role && !allowedRoles.includes(userData.role)) {
      const redirectPath = userData.role === "companion" ? "/dashboard/companion" : "/dashboard/user";
      router.replace(redirectPath);
    }
  }, [user, userData, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sunlo-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sunlo-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles.length > 0 && userData?.role && !allowedRoles.includes(userData.role)) return null;

  return <>{children}</>;
}
