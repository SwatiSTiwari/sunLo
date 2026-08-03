"use client";

import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import Logo from "@/components/Logo";

export default function Navbar() {
  const { user, userData, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-orange-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          <Link
            href="/browse"
            className="text-sm font-medium text-sunlo-text/80 transition-colors hover:text-sunlo-primary"
          >
            Browse
          </Link>
          {user ? (
            <Link
              href={
                userData?.role === "companion"
                  ? "/dashboard/companion"
                  : "/dashboard/user"
              }
              className="text-sm font-medium text-sunlo-text/80 transition-colors hover:text-sunlo-primary"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login?role=user"
              className="text-sm font-medium text-sunlo-text/80 transition-colors hover:text-sunlo-primary"
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={logout}
              className="rounded-full bg-gradient-to-r from-sunlo-primary to-sunlo-accent px-5 py-2 text-sm font-semibold text-white shadow-button transition-all hover:from-sunlo-primary-dark hover:to-sunlo-primary"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login?role=user"
              className="rounded-full bg-gradient-to-r from-sunlo-primary to-sunlo-accent px-5 py-2 text-sm font-semibold text-white shadow-button transition-all hover:from-sunlo-primary-dark hover:to-sunlo-primary"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
