"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsPanel } from "@/components/notifications-panel";

export type HeaderLink = {
  href: string;
  label: string;
  active?: boolean;
};

type ResponsiveHeaderProps = {
  links?: HeaderLink[];
  initials?: string;
  homeHref?: string;
  homeLabel?: string;
  showLogout?: boolean;
};

export function ResponsiveHeader({
  links = [],
  initials,
  homeHref = "/",
  homeLabel,
  showLogout = false,
}: ResponsiveHeaderProps) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoggingOut(false);
      window.alert(`We could not sign you out. ${error.message}`);
      return;
    }

    setOpen(false);
    router.push("/login?loggedOut=1");
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link href={homeHref} className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 font-bold text-white">
              D
            </span>
            <span className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              Drop2Earn
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium transition ${
                  link.active
                    ? "border-b-2 border-green-600 text-green-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {showLogout && <NotificationsPanel />}
            {initials && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                {initials}
              </span>
            )}
            {homeLabel && (
              <Link
                href={homeHref}
                className="hidden rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:block"
              >
                {homeLabel}
              </Link>
            )}
            {showLogout && (
              <span className="group relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                  className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                  aria-label={loggingOut ? "Signing out" : "Sign out"}
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12H3m0 0l4-4m-4 4l4 4M13 5V4a2 2 0 012-2h4a2 2 0 012 2v16a2 2 0 01-2 2h-4a2 2 0 01-2-2v-1"
                    />
                  </svg>
                </button>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  {loggingOut ? "Signing out..." : "Sign out"}
                </span>
              </span>
            )}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 md:hidden"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                {open ? (
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-navigation" className="border-t border-gray-100 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3 text-sm font-medium ${
                    link.active
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {homeLabel && (
                <Link
                  href={homeHref}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {homeLabel}
                </Link>
              )}
              {showLogout && (
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                  className="rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {loggingOut ? "Signing out..." : "Sign out"}
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
