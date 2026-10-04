"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [role, setRole] = useState<"collector" | "recycler">("collector");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
          
          {/* Left side */}
          <div className="hidden bg-green-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-green-600">
                  D
                </div>
                <span className="text-xl font-bold">Drop2Earn</span>
              </Link>

              <div className="mt-24">
                <p className="text-sm font-semibold uppercase tracking-wider text-green-100">
                  Zambia's recycling value chain
                </p>

                <h1 className="mt-4 text-4xl font-bold leading-tight">
                  Turn recyclable waste into value.
                </h1>

                <p className="mt-6 max-w-md text-lg leading-8 text-green-50">
                  Connect with the recycling economy, track verified
                  collections and create measurable environmental impact.
                </p>
              </div>
            </div>

            <p className="text-sm text-green-100">
              Collect. Verify. Earn. Recycle.
            </p>
          </div>

          {/* Right side */}
          <div className="p-8 sm:p-12">
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              ← Back to home
            </Link>

            <div className="mt-10">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome to Drop2Earn
              </h2>

              <p className="mt-2 text-gray-600">
                Choose how you want to use the platform.
              </p>
            </div>

            {/* Role selection */}
            <div className="mt-8 space-y-4">
              <button
                onClick={() => setRole("collector")}
                className={`w-full rounded-2xl border-2 p-5 text-left transition ${
                  role === "collector"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">♻️</div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      I'm a Collector
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      Record recyclable materials you collect and track your
                      verified collections and earnings.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRole("recycler")}
                className={`w-full rounded-2xl border-2 p-5 text-left transition ${
                  role === "recycler"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🏭</div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      I'm a Recycler
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      View available recyclable materials and manage verified
                      supply.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Contact details */}
            <div className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Phone number
                </label>

                <input
                  type="tel"
                  placeholder="+260 97 000 0000"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            <button className="mt-6 w-full rounded-xl bg-green-600 py-4 font-semibold text-white transition hover:bg-green-700">
              Sign in as {role === "collector" ? "Collector" : "Recycler"}
            </button>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-green-600 hover:text-green-700"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}