"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Transaction = {
  id: string;
  collector: string;
  material: string;
  declaredWeight: number;
  verifiedWeight: number;
  rate: number;
  earnings: number;
  date: string;
  location: string;
  status: string;
};

export default function RecyclerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("drop2earn_transactions");

    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  const verifiedTransactions = transactions.filter(
    (transaction) => transaction.status === "Verified"
  );

  const totalWeight = verifiedTransactions.reduce(
    (total, transaction) => total + transaction.verifiedWeight,
    0
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-xl font-bold text-white">
              D
            </div>

            <span className="text-xl font-bold text-gray-900">
              Drop2Earn
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-500 sm:block">
              Recycler Dashboard
            </span>

            <Link
              href="/"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
            RECYCLER
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Available recyclable materials
          </h1>

          <p className="mt-2 text-gray-600">
            View verified materials collected through Drop2Earn.
          </p>
        </div>

        {/* Summary */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">
              Verified collections
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {verifiedTransactions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">
              Available material
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalWeight.toFixed(1)} kg
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">
              Platform status
            </p>

            <p className="mt-2 text-xl font-bold text-green-600">
              Active
            </p>
          </div>
        </div>

        {/* Transactions */}
        <section className="mt-10">
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Verified material supply
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Materials that have been verified and are available in the
                recycling chain.
              </p>
            </div>

            {verifiedTransactions.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-gray-500">
                  No verified materials available yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {verifiedTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900">
                          {transaction.material}
                        </h3>

                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Verified
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        Collector: {transaction.collector}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Location: {transaction.location}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Date: {transaction.date}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {transaction.verifiedWeight.toFixed(1)} kg
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Verified weight
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}