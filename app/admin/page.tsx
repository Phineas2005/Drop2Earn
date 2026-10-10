"use client";

import { useEffect, useState } from "react";
import { RoleGate } from "@/components/role-gate";
import { ResponsiveHeader } from "@/components/responsive-header";
import { supabase } from "@/lib/supabase";

type CollectionPoint = {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
  pendingCount: number;
};

type Verifier = {
  id: string;
  full_name: string;
  collection_point_id: string | null;
};

type AdminReservation = {
  id: string;
  recycler_name: string;
  material: string;
  verified_weight: number | string | null;
  location: string | null;
  status: string;
};

type AdminPayout = {
  id: string;
  collector_name: string;
  material: string;
  verified_weight: number | string | null;
  earnings: number | string | null;
  payout_status: string;
};

export default function AdminPage() {
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [verifiers, setVerifiers] = useState<Verifier[]>([]);
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadAdminData() {
    setLoading(true);
    setErrorMessage("");

    const { data: pointRows, error: pointsError } = await supabase
      .from("collection_points")
      .select("id, name, location, is_active")
      .order("name");

    if (pointsError) {
      setErrorMessage(pointsError.message);
      setLoading(false);
      return;
    }

    const { data: verifierRows, error: verifiersError } = await supabase
      .from("profiles")
      .select("id, full_name, collection_point_id")
      .eq("role", "verifier")
      .order("full_name");

    if (verifiersError) {
      setErrorMessage(verifiersError.message);
      setLoading(false);
      return;
    }

    const { data: pendingRows, error: pendingError } = await supabase
      .from("collections")
      .select("collection_point_id")
      .eq("status", "pending");

    if (pendingError) {
      setErrorMessage(pendingError.message);
      setLoading(false);
      return;
    }

    const { data: reservationRows, error: reservationsError } =
      await supabase.rpc("get_admin_reservations");

    if (reservationsError) {
      setErrorMessage(reservationsError.message);
      setLoading(false);
      return;
    }

    const { data: payoutRows, error: payoutsError } =
      await supabase.rpc("get_admin_payouts");

    if (payoutsError) {
      setErrorMessage(payoutsError.message);
      setLoading(false);
      return;
    }

    const pendingCounts = (pendingRows ?? []).reduce<Record<string, number>>(
      (counts, row) => {
        if (row.collection_point_id) {
          counts[row.collection_point_id] =
            (counts[row.collection_point_id] ?? 0) + 1;
        }
        return counts;
      },
      {}
    );

    setPoints(
      (pointRows ?? []).map((point) => ({
        ...point,
        pendingCount: pendingCounts[point.id] ?? 0,
      }))
    );
    setVerifiers(verifierRows ?? []);
    setReservations((reservationRows ?? []) as AdminReservation[]);
    setPayouts((payoutRows ?? []) as AdminPayout[]);
    setAssignments(
      (verifierRows ?? []).reduce<Record<string, string>>((values, verifier) => {
        values[verifier.id] = verifier.collection_point_id ?? "";
        return values;
      }, {})
    );
    setLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadAdminData();
    });
  }, []);

  async function addCollectionPoint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.from("collection_points").insert({
      name: newName.trim(),
      location: newLocation.trim(),
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setNewName("");
      setNewLocation("");
      setSuccessMessage("Collection point added.");
      await loadAdminData();
    }
    setSaving(false);
  }

  async function toggleCollectionPoint(point: CollectionPoint) {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("collection_points")
      .update({ is_active: !point.is_active })
      .eq("id", point.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage(
        `${point.name} is now ${point.is_active ? "inactive" : "active"}.`
      );
      await loadAdminData();
    }
    setSaving(false);
  }

  async function assignVerifier(verifierId: string) {
    const pointId = assignments[verifierId];
    if (!pointId) {
      setErrorMessage("Select a collection point before assigning the verifier.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.rpc("admin_assign_verifier", {
      target_profile_id: verifierId,
      target_collection_point_id: pointId,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Verifier assignment saved.");
      await loadAdminData();
    }
    setSaving(false);
  }

  async function completeReservation(reservationId: string) {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.rpc("complete_material_reservation", {
      target_reservation_id: reservationId,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Material handoff marked as completed.");
      await loadAdminData();
    }

    setSaving(false);
  }

  async function markPaid(collectionId: string) {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.rpc("mark_collection_paid", {
      target_collection_id: collectionId,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Collector payout marked as paid.");
      await loadAdminData();
    }
    setSaving(false);
  }

  return (
    <RoleGate allowedRoles={["admin"]}>
      <main className="min-h-screen bg-gray-50">
        <ResponsiveHeader
          showLogout
          links={[{ href: "/verification", label: "Verification" }]}
        />

        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
            ADMINISTRATION
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Manage collection operations
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Add collection points, control their availability and assign
            verifiers to the locations they manage.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              {successMessage}
            </div>
          )}

          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Add collection point
            </h2>
            <form
              onSubmit={addCollectionPoint}
              className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Display name, e.g. Drop2Earn Hub — Kabwata"
                required
                className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
              <input
                value={newLocation}
                onChange={(event) => setNewLocation(event.target.value)}
                placeholder="Location, e.g. Kabwata"
                required
                className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                Add point
              </button>
            </form>
          </section>

          <section className="mt-8 rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Collection points
              </h2>
            </div>
            {loading ? (
              <p className="p-8 text-center text-gray-500">Loading points...</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {points.map((point) => (
                  <div
                    key={point.id}
                    className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900">{point.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {point.location} · {point.pendingCount} pending
                        {point.pendingCount === 1 ? " collection" : " collections"}
                      </p>
                    </div>
                    <button
                      onClick={() => void toggleCollectionPoint(point)}
                      disabled={saving}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                        point.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {point.is_active ? "Active" : "Inactive"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Verifier assignments
              </h2>
            </div>
            {verifiers.length === 0 ? (
              <p className="p-6 text-gray-500">
                No verifier accounts exist yet. Promote an account to
                <code className="mx-1 rounded bg-gray-100 px-1">verifier</code>
                in Supabase before assigning a point.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {verifiers.map((verifier) => (
                  <div
                    key={verifier.id}
                    className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                  >
                    <p className="font-semibold text-gray-900">
                      {verifier.full_name}
                    </p>
                    <div className="flex gap-3">
                      <select
                        value={assignments[verifier.id] ?? ""}
                        onChange={(event) =>
                          setAssignments((current) => ({
                            ...current,
                            [verifier.id]: event.target.value,
                          }))
                        }
                        className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
                      >
                        <option value="">Select active point</option>
                        {points
                          .filter((point) => point.is_active)
                          .map((point) => (
                            <option key={point.id} value={point.id}>
                              {point.location}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => void assignVerifier(verifier.id)}
                        disabled={saving}
                        className="rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Material handoffs
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Confirm pickup requests after the physical handoff is complete.
              </p>
            </div>
            {reservations.length === 0 ? (
              <p className="p-6 text-gray-500">No reservations yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900">
                          {reservation.material}
                        </h3>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          {reservation.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Recycler: {reservation.recycler_name} ·{" "}
                        {Number(reservation.verified_weight ?? 0).toFixed(1)} kg
                        {" · "}
                        {reservation.location || "Collection Point"}
                      </p>
                    </div>
                    {reservation.status === "pickup_requested" && (
                      <button
                        onClick={() => void completeReservation(reservation.id)}
                        disabled={saving}
                        className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Confirm handoff
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Collector payouts
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Pending payouts appear after a completed material handoff.
                Mark verified earnings as paid once the collector has been paid.
              </p>
            </div>
            {payouts.length === 0 ? (
              <p className="p-6 text-gray-500">No verified earnings yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {payout.collector_name} · {payout.material}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {Number(payout.verified_weight ?? 0).toFixed(1)} kg ·
                        {" "}K{Number(payout.earnings ?? 0).toFixed(2)}
                      </p>
                    </div>
                    {payout.payout_status === "paid" ? (
                      <span className="rounded-full bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                        Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => void markPaid(payout.id)}
                        disabled={saving}
                        className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Mark as paid
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </RoleGate>
  );
}
