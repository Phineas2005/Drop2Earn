"use client";

import Link from "next/link";

const collections = [
  {
    material: "PET Plastic",
    weight: "9.6 kg",
    date: "Today",
    status: "Verified",
    amount: "K48.00",
  },
  {
    material: "HDPE Plastic",
    weight: "6.2 kg",
    date: "Yesterday",
    status: "Pending",
    amount: "—",
  },
  {
    material: "PET Plastic",
    weight: "8.8 kg",
    date: "28 Sep",
    status: "Verified",
    amount: "K44.00",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top navigation */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 font-bold text-white">
              D
            </div>

            <span className="text-xl font-bold text-gray-900">
              Drop2Earn
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-500 sm:block">
              Collector
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
              PM
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome */}
        <div>
          <p className="text-sm font-medium text-green-600">
            COLLECTOR DASHBOARD
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Good morning, Phineas 👋
          </h1>

          <p className="mt-2 text-gray-600">
            Here's an overview of your recycling activity.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">
              Total recovered
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              24.6 kg
            </p>

            <p className="mt-2 text-sm text-green-600">
              ↑ 12% this month
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">
              Verified earnings
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              K92.00
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Available balance
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">
              Collections
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              3
            </p>

            <p className="mt-2 text-sm text-gray-500">
              This month
            </p>
          </div>
        </div>

        {/* Main action */}
        <div className="mt-8 rounded-2xl bg-green-600 p-8 text-white">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-100">
              New collection
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Have recyclable material to record?
            </h2>

            <p className="mt-2 leading-7 text-green-50">
              Record what you've collected and take it to a verified
              collection point for weighing and verification.
            </p>

            <Link
              href="/dashboard/collections/new"
              className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-green-700 hover:bg-green-50"
            >
              + Record a collection
            </Link>
          </div>
        </div>

        {/* Recent collections */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent collections
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest recorded recyclable materials.
              </p>
            </div>

            <button className="text-sm font-semibold text-green-600 hover:text-green-700">
              View all
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="divide-y divide-gray-100">
              {collections.map((collection) => (
                <div
                  key={`${collection.material}-${collection.date}`}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
                      ♻️
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {collection.material}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {collection.weight} · {collection.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        collection.status === "Verified"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {collection.status}
                    </span>

                    <span className="font-semibold text-gray-900">
                      {collection.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}