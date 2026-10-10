"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RoleGate } from "@/components/role-gate";
import { ResponsiveHeader } from "@/components/responsive-header";

export default function NewCollectionPage() {
  const [material, setMaterial] = useState("PET Plastic");
  const [weight, setWeight] = useState("");
  const [collectionPointId, setCollectionPointId] = useState("");
  const [collectionPoints, setCollectionPoints] = useState<
    { id: string; name: string; location: string }[]
  >([]);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      void loadCollectionPoints();
    });

    async function loadCollectionPoints() {
      const { data, error: pointsError } = await supabase
        .from("collection_points")
        .select("id, name, location")
        .eq("is_active", true)
        .order("name");

      if (pointsError) {
        setError(pointsError.message);
      } else {
        setCollectionPoints(data ?? []);
      }
      setLoadingPoints(false);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to record a collection.");
      setSubmitting(false);
      return;
    }

    const selectedPoint = collectionPoints.find(
      (point) => point.id === collectionPointId
    );

    if (!selectedPoint) {
      setError("Select a valid collection point.");
      setSubmitting(false);
      return;
    }

    // Insert record into Supabase `collections` table
    const { error: insertError } = await supabase.from("collections").insert({
      collector_id: user.id,
      collection_point_id: selectedPoint.id,
      material: material,
      declared_weight: parseFloat(weight),
      location: selectedPoint.location,
      notes: notes.trim() || null,
      status: "pending",
      created_at: date ? new Date(`${date}T00:00:00`).toISOString() : new Date().toISOString(),
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <RoleGate allowedRoles={["collector"]}>
        <main className="min-h-screen bg-gray-50">
        <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
          <div className="w-full rounded-3xl bg-white p-8 text-center shadow-xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Collection recorded
            </h1>

            <p className="mt-3 leading-7 text-gray-700">
              Your collection has been submitted and is now waiting for
              verification at the collection point.
            </p>

            <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-left">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Material</span>
                <span className="font-semibold text-gray-900">
                  {material}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4">
                <span className="text-gray-600">Declared weight</span>
                <span className="font-semibold text-gray-900">
                  {weight} kg
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold text-yellow-700">
                  Pending verification
                </span>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="mt-8 block w-full rounded-xl bg-green-600 py-4 font-semibold text-white transition hover:bg-green-700"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
        </main>
      </RoleGate>
    );
  }

  return (
    <RoleGate allowedRoles={["collector"]}>
      <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <ResponsiveHeader homeHref="/dashboard" homeLabel="Cancel" showLogout />

      {/* Main content */}
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
            NEW COLLECTION
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Record recyclable material
          </h1>

          <p className="mt-2 text-gray-700">
            Tell us what you collected. The material will be weighed and
            verified at an approved collection point.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {/* Material type */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="block text-sm font-semibold text-gray-900">
              Material type
            </label>

            <p className="mt-1 text-sm text-gray-600">
              Select the main recyclable material you collected.
            </p>

            <select
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
              className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="PET Plastic">PET Plastic</option>
              <option value="HDPE Plastic">HDPE Plastic</option>
              <option value="Other Plastic">Other Plastic</option>
              <option value="Cardboard">Cardboard</option>
              <option value="Paper">Paper</option>
              <option value="Aluminium">Aluminium</option>
              <option value="Glass">Glass</option>
            </select>
          </div>

          {/* Weight */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="block text-sm font-semibold text-gray-900">
              Estimated weight
            </label>

            <p className="mt-1 text-sm text-gray-600">
              Enter the amount you collected. The final weight will be
              confirmed during verification.
            </p>

            <div className="mt-4 flex">
              <input
                type="number"
                min="0"
                step="0.1"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="e.g. 10"
                required
                className="min-w-0 flex-1 rounded-l-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <div className="flex items-center rounded-r-xl border border-l-0 border-gray-300 bg-gray-50 px-5 py-3.5 font-semibold text-gray-700">
                kg
              </div>
            </div>
          </div>

          {/* Collection point */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="block text-sm font-semibold text-gray-900">
              Collection point
            </label>

            <p className="mt-1 text-sm text-gray-600">
              Choose where you will take the material for verification.
            </p>

            <select
              value={collectionPointId}
              onChange={(event) => setCollectionPointId(event.target.value)}
              required
              disabled={loadingPoints || collectionPoints.length === 0}
              className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="">
                {loadingPoints
                  ? "Loading collection points..."
                  : "Select a collection point"}
              </option>
              {collectionPoints.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name}
                </option>
              ))}
            </select>
          </div>

          {/* Collection date */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="block text-sm font-semibold text-gray-700">
              Collection date
            </label>

            <p className="mt-1 text-sm text-gray-600">
              When did you collect this material?
            </p>

            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="block text-sm font-semibold text-gray-900">
              Notes{" "}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>

            <p className="mt-1 text-sm text-gray-600">
              Add any useful information about this collection.
            </p>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="For example: Collected from households around the community..."
              className="mt-4 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Verification notice */}
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                ✓
              </div>

              <div>
                <p className="font-semibold text-green-900">
                  Your collection will be verified
                </p>

                <p className="mt-1 text-sm leading-6 text-green-800">
                  The collection point will confirm the actual material type
                  and weight before your earnings are calculated.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-green-600 py-4 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit collection"}
          </button>
        </form>
      </div>
      </main>
    </RoleGate>
  );
}