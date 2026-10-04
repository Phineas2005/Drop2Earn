"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [role, setRole] = useState<"collector" | "recycler">("collector");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl sm:p-10">

          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to home
          </Link>

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

          {/* Form */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Full name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Phone number
              </label>

              <input
                type="tel"
                placeholder="+260 97 000 0000"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Location
              </label>

              <input
                type="text"
                placeholder="e.g. Lusaka"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <button className="mt-6 w-full rounded-xl bg-green-600 py-4 font-semibold text-white hover:bg-green-700">
            Create {role === "collector" ? "Collector" : "Recycler"} Account
          </button>

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