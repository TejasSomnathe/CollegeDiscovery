"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { BookmarkIcon, GraduationCapIcon, LogOutIcon, UserIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-600">
            <GraduationCapIcon className="w-6 h-6 text-indigo-600" />
            <span className="text-indigo-700">CampusPath</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/colleges"
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/colleges")
                  ? "text-indigo-600"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Colleges
            </Link>
            <Link
              href="/compare"
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/compare")
                  ? "text-indigo-600"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Compare
            </Link>
            {session?.user && (
              <Link
                href="/saved"
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-1",
                  isActive("/saved")
                    ? "text-indigo-600"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <BookmarkIcon className="w-4 h-4" />
                Saved
              </Link>
            )}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <>
                <span className="text-sm text-slate-600 flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4" />
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-2">
            <Link href="/colleges" className="block px-2 py-2 text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>
              Colleges
            </Link>
            <Link href="/compare" className="block px-2 py-2 text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>
              Compare
            </Link>
            {session?.user ? (
              <>
                <Link href="/saved" className="block px-2 py-2 text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>
                  Saved
                </Link>
                <button
                  onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                  className="block w-full text-left px-2 py-2 text-sm text-red-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-2 py-2 text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
                <Link href="/auth/register" className="block px-2 py-2 text-sm font-medium text-indigo-600" onClick={() => setMobileOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
