
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RoleGate } from "@/components/role-gate";
import { ResponsiveHeader } from "@/components/responsive-header";

type Collection = {
  id: string;
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

type ProfileData = {
  full_name: string | null;
};

type SupabaseCollection = {
  id: string;
  material: string;
  declared_weight: number | string;
  created_at: string;
  location: string | null;
  profiles: ProfileData | ProfileData[] | null;
};

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
  const [pendingCollections, setPendingCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [verifiedWeight, setVerifiedWeight] = useState("");
  const [verifiedCollections, setVerifiedCollections] = useState<
    VerifiedCollection[]
  >([]);
  const [completedCollection, setCompletedCollection] =
    useState<VerifiedCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [collectionPointName, setCollectionPointName] = useState(
    "Assigned collection point"
  );

  async function fetchPendingCollections() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Your session has expired. Please sign in again.");

      const { data: verifierProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role, collection_point_id")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (
        verifierProfile.role === "verifier" &&
        !verifierProfile.collection_point_id
      ) {
        throw new Error(
          "Your account is not assigned to a collection point. Ask an admin to assign one."
        );
      }

      if (verifierProfile.collection_point_id) {
        const { data: point, error: pointError } = await supabase
          .from("collection_points")
          .select("name")
          .eq("id", verifierProfile.collection_point_id)
          .single();

        if (pointError) throw pointError;
        setCollectionPointName(point.name);
      } else if (verifierProfile.role === "admin") {
        setCollectionPointName("All collection points");
      }

      let pendingQuery = supabase
        .from("collections")
        .select(
          "id, material, declared_weight, created_at, location, profiles!collections_collector_id_fkey(full_name)"
        )
        .eq("status", "pending");

      if (verifierProfile.collection_point_id) {
        pendingQuery = pendingQuery.eq(
          "collection_point_id",
          verifierProfile.collection_point_id
        );
      }

      const { data, error } = await pendingQuery.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      const rows = (data ?? []) as unknown as SupabaseCollection[];

      const formatted: Collection[] = rows.map((col) => {
        const profile = Array.isArray(col.profiles)
          ? col.profiles[0]
          : col.profiles;

        return {
          id: col.id,
          collector: profile?.full_name || "Collector",
          material: col.material,
          declaredWeight: Number(col.declared_weight) || 0,
          date: new Date(col.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          location: col.location || "Collection Hub",
        };
      });

      setPendingCollections(formatted);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not load pending collections.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void fetchPendingCollections();
    });
  }, []);

  function closeModal() {
    if (saving) return;
    setSelectedCollection(null);
    setVerifiedWeight("");
    setErrorMessage("");
  }

  function openVerification(collection: Collection) {
    setSelectedCollection(collection);
    setVerifiedWeight(collection.declaredWeight.toString());
    setCompletedCollection(null);
    setErrorMessage("");
  }

  async function handleVerify() {
    if (!selectedCollection || saving) return;

    const actualWeight = Number(verifiedWeight);

    if (
      !verifiedWeight.trim() ||
      !Number.isFinite(actualWeight) ||
      actualWeight <= 0
    ) {
      setErrorMessage("Enter a valid verified weight greater than zero.");
      return;
    }

    if (actualWeight > selectedCollection.declaredWeight) {
      const confirmed = window.confirm(
        "The verified weight is greater than the declared weight. Do you want to continue?"
      );
      if (!confirmed) return;
    }

    const rate = payoutRates[selectedCollection.material];

    if (rate === undefined) {
      setErrorMessage(
        "No demonstration payout rate is configured for this material."
      );
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const { error } = await supabase.rpc("verify_collection", {
        target_collection_id: selectedCollection.id,
        target_verified_weight: actualWeight,
        target_rate_per_kg: rate,
      });

      if (error) throw error;

      const verifiedCollection: VerifiedCollection = {
        ...selectedCollection,
        verifiedWeight: actualWeight,
        rate,
        earnings: actualWeight * rate,
      };

      setPendingCollections((previous) =>
        previous.filter((item) => item.id !== selectedCollection.id)
      );

      setVerifiedCollections((previous) => [
        verifiedCollection,
        ...previous,
      ]);

      setCompletedCollection(verifiedCollection);
      setSelectedCollection(null);
      setVerifiedWeight("");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error &&
              typeof error.message === "string"
            ? error.message
            : "Verification failed. Please try again.";
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <RoleGate allowedRoles={["verifier", "admin"]}>
      <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <ResponsiveHeader
        initials="CP"
        showLogout
        links={[{ href: "/admin", label: "Admin" }]}
      />

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
            and the collector&apos;s earnings are calculated.
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
              {collectionPointName}
            </p>
          </div>
        </div>

        {/* PAGE ERROR */}
        {errorMessage && !selectedCollection && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {errorMessage}
            <button
              onClick={() => {
                setLoading(true);
                setErrorMessage("");
                void fetchPendingCollections();
              }}
              className="ml-3 font-semibold underline"
            >
              Reload collections
            </button>
          </div>
        )}

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
                      The collector&apos;s earnings have been calculated and
                      the transaction has been recorded.
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
                Demo payout rate only — this value demonstrates the Drop2Earn
                MVP and is not a claimed market price.
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
            collector&apos;s earnings.
          </p>

          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                Loading pending collections...
              </div>
            ) : (
              pendingCollections.map((collection) => (
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
              ))
            )}

            {!loading &&
              pendingCollections.length === 0 &&
              !errorMessage && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
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
                Drop2Earn uses demonstration payout rates to show how verified
                weight can be converted into earnings. These are prototype
                values, not actual market prices.
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
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="w-full max-w-lg rounded-3xl bg-white shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
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
                  disabled={saving}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-2xl font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
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
                    <span className="text-gray-600">Declared weight</span>
                    <span className="font-bold text-gray-900">
                      {selectedCollection.declaredWeight} kg
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="verified-weight"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Actual verified weight
                  </label>
                  <p className="mt-1 text-sm text-gray-600">
                    Enter the weight measured on the collection-point scale.
                  </p>
                  <div className="mt-4 flex">
                    <input
                      id="verified-weight"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={verifiedWeight}
                      onChange={(event) => {
                        setVerifiedWeight(event.target.value);
                        setErrorMessage("");
                      }}
                      disabled={saving}
                      className="min-w-0 flex-1 rounded-l-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
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
                        {(payoutRates[selectedCollection.material] ?? 0).toFixed(2)}
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
                    Verification confirms the actual material weight. Drop2Earn
                    uses the verified weight — not the collector&apos;s original
                    estimate — to calculate earnings.
                  </p>
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                  >
                    {errorMessage}
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-6">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-gray-300 bg-white py-3.5 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleVerify()}
                  disabled={
                    saving ||
                    !verifiedWeight.trim() ||
                    !Number.isFinite(Number(verifiedWeight)) ||
                    Number(verifiedWeight) <= 0
                  }
                  className="flex-1 rounded-xl bg-green-600 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {saving ? "Verifying..." : "Confirm verification"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </RoleGate>
  );
}
