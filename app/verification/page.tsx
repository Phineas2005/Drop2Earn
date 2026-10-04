"use client";

import { useState } from "react";
import Link from "next/link";

type Collection = {
  id: number;
  collector: string;
  material: string;
  declaredWeight: number;
  date: string;
  location: string;
};

const pendingCollections: Collection[] = [
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

export default function VerificationPage() {
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  const [verifiedWeight, setVerifiedWeight] = useState("");

  const [verified, setVerified] = useState<number[]>([]);

  function handleVerify() {
    if (!selectedCollection || !verifiedWeight) return;

    setVerified([...verified, selectedCollection.id]);
    setSelectedCollection(null);
    setVerifiedWeight("");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
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

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page heading */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
            VERIFICATION CENTRE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Verify collections
          </h1>

          <p className="mt-2 max-w-2xl text-gray-700">
            Confirm the material type and actual weight before a collection is
            marked as verified.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-600">
              Pending verification
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {pendingCollections.length - verified.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-600">
              Verified today
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {verified.length}
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

        {/* Pending collections */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">
            Pending collections
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Select a collection to verify its actual weight.
          </p>

          <div className="mt-5 space-y-4">
            {pendingCollections.map((collection) => {
              const isVerified = verified.includes(collection.id);

              return (
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

                      {isVerified ? (
                        <div className="rounded-xl bg-green-100 px-5 py-3 text-center">
                          <p className="font-semibold text-green-700">
                            ✓ Verified
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCollection(collection);
                            setVerifiedWeight(
                              collection.declaredWeight.toString()
                            );
                          }}
                          className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
                        >
                          Verify collection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verification modal */}
      {selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
                  VERIFY COLLECTION
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  Confirm actual weight
                </h2>
              </div>

              <button
                onClick={() => setSelectedCollection(null)}
                className="text-2xl font-medium text-gray-500 hover:text-gray-900"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-5">
              <p className="font-semibold text-gray-900">
                {selectedCollection.material}
              </p>

              <p className="mt-1 text-sm text-gray-700">
                Collector: {selectedCollection.collector}
              </p>

              <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
                <span className="text-gray-600">Declared weight</span>

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

            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm leading-6 text-blue-800">
                Verification confirms that this collection actually reached
                the collection point. The verified weight will be used to
                calculate the collector's earnings.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedCollection(null)}
                className="flex-1 rounded-xl border border-gray-300 py-3.5 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleVerify}
                className="flex-1 rounded-xl bg-green-600 py-3.5 font-semibold text-white hover:bg-green-700"
              >
                Confirm verification
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}