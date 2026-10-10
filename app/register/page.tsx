"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandedLoader } from "@/components/branded-loader";

export default function RegisterPage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [role, setRole] = useState<"collector" | "recycler">("collector");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const hasSeenWelcome = window.localStorage.getItem(
      "drop2earn-signup-welcome-seen"
    );

    if (hasSeenWelcome) {
      queueMicrotask(() => setShowWelcome(false));
      return;
    }

    const timeout = window.setTimeout(() => {
      window.localStorage.setItem("drop2earn-signup-welcome-seen", "true");
      setShowWelcome(false);
    }, 4200);

    return () => window.clearTimeout(timeout);
  }, []);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const email = `${phone.trim()}@drop2earn.app`;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: role,
          location: location,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Redirect user to login page after successful account creation
    router.push("/login");
  };

  if (showWelcome) {
    return (
      <BrandedLoader
        message="Your next chapter starts here"
        detail="Setting up a cleaner way to connect, collect and earn."
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl sm:p-10">

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Home
            </Link>
          </div>

          <div className="mt-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-xl font-bold text-white">
              D
            </div>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Create your Drop2Earn account
            </h1>

            <p className="mt-2 text-gray-600">
              Join the digital recycling value chain.
            </p>
          </div>

          {/* Account type */}
          <div className="mt-8">
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              I want to register as
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRole("collector")}
                className={`rounded-xl border-2 p-4 text-left ${
                  role === "collector"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <div className="font-bold text-gray-900">Collector</div>
                <div className="mt-1 text-sm text-gray-500">
                  Collect & earn
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("recycler")}
                className={`rounded-xl border-2 p-4 text-left ${
                  role === "recycler"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <div className="font-bold text-gray-900">Recycler</div>
                <div className="mt-1 text-sm text-gray-500">
                  Buy & process
                </div>
              </button>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleRegister}>
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full name
                </label>

                <input
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Phone number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]+"
                  autoComplete="tel"
                  required
                  maxLength={12}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+260 97 000 0000"
                  onInput={(event) => {
                    event.currentTarget.value =
                      event.currentTarget.value.replace(/\D/g, "");
                  }}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Location
                </label>

                <input
                  type="text"
                  required
                  minLength={2}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lusaka"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3.5 pr-12 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.3A10.8 10.8 0 0112 4c5 0 8.5 4 9.8 6a11.7 11.7 0 01-3.1 3.5M6.2 6.2A12.3 12.3 0 002.2 10c1.3 2 4.8 6 9.8 6 1 0 1.9-.2 2.7-.5" />
                      </svg>
                    ) : (
                      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.2 10s3.5-6 9.8-6 9.8 6 9.8 6-3.5 6-9.8 6-9.8-6-9.8-6z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-green-600 py-4 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading
                ? "Creating account..."
                : `Create ${role === "collector" ? "Collector" : "Recycler"} Account`}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-600"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}