"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RoleGate } from "@/components/role-gate";
import { ResponsiveHeader } from "@/components/responsive-header";

type SupplyItem = {
  id: string;
  material: string;
  verifiedWeight: number;
  location: string;
  verifiedAt: string;
};

type SupabaseSupplyItem = {
  id: string;
  material: string;
  verified_weight: number | string | null;
  location: string | null;
  verified_at: string;
};

type Reservation = {
  id: string;
  collection_id: string;
  material: string;
  verified_weight: number | string | null;
  location: string | null;
  status: string;
  created_at: string;
};

export default function RecyclerPage() {
  const [supply, setSupply] = useState<SupplyItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [requestingPickupId, setRequestingPickupId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function fetchVerifiedSupply() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("verified_material_supply")
      .select("*")
      .order("verified_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
    } else {
      const rows = (data ?? []) as unknown as SupabaseSupplyItem[];
      setSupply(
        rows.map((item) => ({
          id: item.id,
          material: item.material,
          verifiedWeight: Number(item.verified_weight) || 0,
          location: item.location || "Collection Point",
          verifiedAt: new Date(item.verified_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        }))
      );
    }
    setLoading(false);
  }

  async function fetchReservations() {
    setLoadingReservations(true);
    const { data, error } = await supabase.rpc("get_my_reservations");

    if (error) {
      setErrorMessage(error.message);
    } else {
      setReservations((data ?? []) as Reservation[]);
    }
    setLoadingReservations(false);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void fetchVerifiedSupply();
      void fetchReservations();
    });
  }, []);

  async function reserveMaterial(collectionId: string) {
    setReservingId(collectionId);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.rpc("reserve_material", {
      target_collection_id: collectionId,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage(
        "Material reserved successfully. The collection is now held for your recycling operation."
      );
      await fetchVerifiedSupply();
    }

    setReservingId(null);
  }

  async function releaseReservation(reservationId: string) {
    setReleasingId(reservationId);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.rpc("release_material_reservation", {
      target_reservation_id: reservationId,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage(
        "Reservation released. The material is available to other recyclers again."
      );
      await Promise.all([fetchVerifiedSupply(), fetchReservations()]);
    }

    setReleasingId(null);
  }

  async function requestPickup(reservationId: string) {
    setRequestingPickupId(reservationId);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.rpc("request_material_pickup", {
      target_reservation_id: reservationId,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Pickup requested. An admin will confirm the handoff.");
      await fetchReservations();
    }

    setRequestingPickupId(null);
  }

  const totalWeight = supply.reduce(
    (total, item) => total + item.verifiedWeight,
    0
  );

  return (
    <RoleGate allowedRoles={["recycler"]}>
      <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <ResponsiveHeader
        showLogout
        homeLabel="Home"
      />

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
              {supply.length}
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

        {/* Supply List */}
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

            {loading ? (
              <div className="p-10 text-center text-gray-500">
                Loading available supply...
              </div>
            ) : supply.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-gray-500">
                  No verified materials available yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {supply.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900">
                          {item.material}
                        </h3>

                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Verified
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        Location: {item.location}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Verified on: {item.verifiedAt}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {item.verifiedWeight.toFixed(1)} kg
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Verified weight
                      </p>
                      <button
                        onClick={() => void reserveMaterial(item.id)}
                        disabled={reservingId !== null}
                        className="mt-4 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {reservingId === item.id
                          ? "Reserving..."
                          : "Reserve material"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        <section className="mt-10 rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900">
              My reservations
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Material currently held for your recycling operation.
            </p>
          </div>

          {loadingReservations ? (
            <div className="p-8 text-center text-gray-500">
              Loading reservations...
            </div>
          ) : reservations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              You have no active reservations.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reservations
                .filter((reservation) =>
                  ["reserved", "pickup_requested"].includes(reservation.status)
                )
                .map((reservation) => (
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
                          {reservation.status === "pickup_requested"
                            ? "Pickup requested"
                            : "Reserved"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        {Number(reservation.verified_weight ?? 0).toFixed(1)} kg
                        {" · "}
                        {reservation.location || "Collection Point"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {reservation.status === "reserved" && (
                        <button
                          onClick={() => void requestPickup(reservation.id)}
                          disabled={requestingPickupId !== null}
                          className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {requestingPickupId === reservation.id
                            ? "Requesting..."
                            : "Request pickup"}
                        </button>
                      )}
                      {reservation.status === "reserved" && (
                        <button
                          onClick={() => void releaseReservation(reservation.id)}
                          disabled={releasingId !== null}
                          className="rounded-xl border border-green-200 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {releasingId === reservation.id
                            ? "Releasing..."
                            : "Release reservation"}
                        </button>
                      )}
                    </div>
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