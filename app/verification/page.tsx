"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Collection = {
  id: number;
  collector: string;
  material: string;
  declaredWeight: number;
  date: string;
  location: string;
};

type VerifiedCollection = Collection & {
  verifiedWeight: number;
  rate: number;
  earnings: number;
};

const demoPendingCollections: Collection[] = [
  {
    id: 1,
    collector: "Phineas Mwale",
    material: "PET Plastic",
    declaredWeight: 10,
    date: "04 Oct 2026",
    location: "Lusaka Central",
  },
  {
    id: 2,
    collector: "Martha Banda",
    material: "HDPE Plastic",
    declaredWeight: 7.5,
    date: "04 Oct 2026",
    location: "Kalingalinga",
  },
  {
    id: 3,
    collector: "Brian Tembo",
    material: "PET Plastic",
    declaredWeight: 12,
    date: "03 Oct 2026",
    location: "Matero",
  },
];

// MVP DEMO RATES — NOT ACTUAL MARKET PRICES
const payoutRates: Record<string, number> = {
  "PET Plastic": 5,
  "HDPE Plastic": 4,
  "Other Plastic": 3,
  Cardboard: 2,
  Paper: 2,
  Aluminium: 5,
  Glass: 2,
};

export default function VerificationPage() {
  const [pendingCollections, setPendingCollections] = useState<
    Collection[]
  >(demoPendingCollections);

  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  const [verifiedWeight, setVerifiedWeight] = useState("");

  const [verifiedCollections, setVerifiedCollections] = useState<
    VerifiedCollection[]
  >([]);

  const [completedCollection, setCompletedCollection] =
    useState<VerifiedCollection | null>(null);

  // Load collections recorded by the collector
  useEffect(() => {
    const savedCollections = localStorage.getItem(
      "drop2earn_pending_collections"
    );

    if (!savedCollections) return;

    try {
      const parsedCollections = JSON.parse(
        savedCollections
      ) as Collection[];

      if (Array.isArray(parsedCollections)) {
        setPendingCollections([
          ...parsedCollections,
          ...demoPendingCollections,
        ]);
      }
    } catch {
      console.log("Could not read pending collections.");
    }
  }, []);

  function closeModal() {
    setSelectedCollection(null);
    setVerifiedWeight("");
  }

  function openVerification(collection: Collection) {
    setSelectedCollection(collection);
    setVerifiedWeight(collection.declaredWeight.toString());
    setCompletedCollection(null);
  }

  function handleVerify() {
    if (!selectedCollection) return;

    const actualWeight = Number(verifiedWeight);

    if (!actualWeight || actualWeight <= 0) return;

    const rate = payoutRates[selectedCollection.material] ?? 0;
    const earnings = actualWeight * rate;

    const verifiedCollection: VerifiedCollection = {
      ...selectedCollection,
      verifiedWeight: actualWeight,
      rate,
      earnings,
    };

    // Save verified transaction
    const existingTransactions = JSON.parse(
      localStorage.getItem("drop2earn_transactions") || "[]"
    );

    existingTransactions.unshift({
      id: Date.now(),
      collector: verifiedCollection.collector,
      material: verifiedCollection.material,
      declaredWeight: verifiedCollection.declaredWeight,
      verifiedWeight: verifiedCollection.verifiedWeight,
      rate: verifiedCollection.rate,
      earnings: verifiedCollection.earnings,
      date: verifiedCollection.date,
      location: verifiedCollection.location,
      status: "Verified",
    });

    localStorage.setItem(
      "drop2earn_transactions",
      JSON.stringify(existingTransactions)
    );

    // Remove the collection from locally submitted pending collections
    const savedCollections = localStorage.getItem(
      "drop2earn_pending_collections"
    );

    if (savedCollections) {
      try {
        const localCollections = JSON.parse(
          savedCollections
        ) as Collection[];

        const remainingCollections = localCollections.filter(
          (collection) => collection.id !== selectedCollection.id
        );

        localStorage.setItem(
          "drop2earn_pending_collections",
          JSON.stringify(remainingCollections)
        );
      } catch {
        console.log("Could not update pending collections.");
      }
    }

    setPendingCollections((previous) =>
      previous.filter((collection) => collection.id !== selectedCollection.id)
    );

    setVerifiedCollections((previous) => [
      ...previous,
      verifiedCollection,
    ]);

    setCompletedCollection(verifiedCollection);

    closeModal();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
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
            <span className="hidden text-sm font-medium text-gray-600 sm:block">
              Collection Point
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
              CP
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* INTRO */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
            VERIFICATION CENTRE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Verify collections
          </h1>

          <p className="mt-2 max-w-2xl text-gray-700">
            Confirm the actual weight before a collection is marked as verified
            and the collector's earnings are calculated.
          </p>
        </div>

        {/* STATS */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-600">
              Pending verification
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {pendingCollections.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-600">
              Verified this session
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {verifiedCollections.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-600">
              Collection point
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              Lusaka Central
            </p>
          </div>
        </div>

        {/* SUCCESS */}
        {completedCollection && (
          <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6 sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white">
                    ✓
                  </div>

                  <div>
                    <p className="font-bold text-green-900">
                      Collection verified
                    </p>

                    <p className="text-sm text-green-800">
                      The collector's earnings have been calculated and the
                      transaction has been recorded.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCompletedCollection(null)}
                  className="text-sm font-semibold text-green-700 hover:text-green-900"
                >
                  Dismiss
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                    Verified weight
                  </p>

                  <p className="mt-1 text-xl font-bold text-green-950">
                    {completedCollection.verifiedWeight.toFixed(1)} kg
                  </p>
                </div>

                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                    Demo rate
                  </p>

                  <p className="mt-1 text-xl font-bold text-green-950">
                    K{completedCollection.rate.toFixed(2)}/kg
                  </p>
                </div>

                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                    Collector earnings
                  </p>

                  <p className="mt-1 text-2xl font-bold text-green-950">
                    K{completedCollection.earnings.toFixed(2)}
                  </p>
                </div>
              </div>

              <p className="text-xs leading-5 text-green-800">
                Demo payout rate only — this value is for demonstrating the
                Drop2Earn MVP and is not a claimed market price.
              </p>
            </div>
          </div>
        )}

        {/* PENDING COLLECTIONS */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">
            Pending collections
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Select a collection to verify its actual weight and calculate the
            collector's earnings.
          </p>

          <div className="mt-5 space-y-4">
            {pendingCollections.map((collection) => (
              <div
                key={collection.id}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
                      ♻️
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        {collection.material}
                      </h3>

                      <p className="mt-1 text-sm text-gray-700">
                        Collector: {collection.collector}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {collection.location} · {collection.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="rounded-xl bg-gray-50 px-5 py-3">
                      <p className="text-xs font-medium text-gray-500">
                        Declared
                      </p>

                      <p className="mt-1 font-bold text-gray-900">
                        {collection.declaredWeight} kg
                      </p>
                    </div>

                    <button
                      onClick={() => openVerification(collection)}
                      className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
                    >
                      Verify collection
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {pendingCollections.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
                  ✓
                </div>

                <h3 className="mt-4 font-bold text-gray-900">
                  All collections verified
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  There are currently no collections waiting for verification.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* DEMO NOTICE */}
        <div className="mt-10 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500 text-sm font-bold text-white">
              i
            </div>

            <div>
              <p className="font-semibold text-yellow-900">
                MVP demonstration rates
              </p>

              <p className="mt-1 text-sm leading-6 text-yellow-800">
                Drop2Earn currently uses demonstration payout rates to show how
                verified weight can be converted into earnings. These are
                configurable prototype values and are not presented as actual
                market prices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFICATION MODAL */}
      {selectedCollection && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
              {/* HEADER */}
              <div className="flex items-start justify-between border-b border-gray-200 p-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
                    VERIFY COLLECTION
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    Confirm actual weight
                  </h2>
                </div>

                <button
                  onClick={closeModal}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-2xl font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Close verification window"
                >
                  ×
                </button>
              </div>

              {/* BODY */}
              <div className="max-h-[75vh] overflow-y-auto p-6">
                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="font-semibold text-gray-900">
                    {selectedCollection.material}
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    Collector: {selectedCollection.collector}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                    <span className="text-gray-600">
                      Declared weight
                    </span>

                    <span className="font-bold text-gray-900">
                      {selectedCollection.declaredWeight} kg
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-900">
                    Actual verified weight
                  </label>

                  <p className="mt-1 text-sm text-gray-600">
                    Enter the weight measured on the collection-point scale.
                  </p>

                  <div className="mt-4 flex">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={verifiedWeight}
                      onChange={(event) =>
                        setVerifiedWeight(event.target.value)
                      }
                      className="min-w-0 flex-1 rounded-l-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />

                    <div className="flex items-center rounded-r-xl border border-l-0 border-gray-300 bg-gray-50 px-5 font-semibold text-gray-700">
                      kg
                    </div>
                  </div>
                </div>

                {/* EARNINGS PREVIEW */}
                {verifiedWeight && Number(verifiedWeight) > 0 && (
                  <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
                    <p className="text-sm font-medium text-green-800">
                      Earnings preview
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-4">
                      <p className="text-sm text-green-700">
                        {Number(verifiedWeight).toFixed(1)} kg × K
                        {(
                          payoutRates[selectedCollection.material] ?? 0
                        ).toFixed(2)}
                        /kg
                      </p>

                      <p className="text-2xl font-bold text-green-900">
                        K
                        {(
                          Number(verifiedWeight) *
                          (payoutRates[selectedCollection.material] ?? 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm leading-6 text-blue-800">
                    Verification confirms the actual material weight.
                    Drop2Earn uses the verified weight — not the collector's
                    original estimate — to calculate earnings.
                  </p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-6">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-gray-300 bg-white py-3.5 font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleVerify}
                  disabled={
                    !verifiedWeight || Number(verifiedWeight) <= 0
                  }
                  className="flex-1 rounded-xl bg-green-600 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Confirm verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}