"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleGate } from "@/components/role-gate";
import { ResponsiveHeader } from "@/components/responsive-header";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

type CollectionPoint = {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
  pendingCount: number;
};

type AdminUser = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
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

type ExportKey = "points" | "users" | "handoffs" | "payouts";

export default function AdminPage() {
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [userPoints, setUserPoints] = useState<Record<string, string>>({});
  const [pointSearch, setPointSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [handoffStatus, setHandoffStatus] = useState("all");
  const [payoutStatus, setPayoutStatus] = useState("all");
  const [selectedExports, setSelectedExports] = useState<
    Record<ExportKey, boolean>
  >({
    points: true,
    users: true,
    handoffs: true,
    payouts: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredPoints = useMemo(() => {
    const query = pointSearch.trim().toLowerCase();
    return points.filter(
      (point) =>
        !query ||
        point.name.toLowerCase().includes(query) ||
        point.location.toLowerCase().includes(query)
    );
  }, [pointSearch, points]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    return users.filter(
      (user) =>
        !query ||
        (user.full_name ?? "").toLowerCase().includes(query) ||
        (user.phone ?? "").toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }, [userSearch, users]);

  const filteredReservations = useMemo(
    () =>
      reservations.filter(
        (reservation) =>
          handoffStatus === "all" || reservation.status === handoffStatus
      ),
    [handoffStatus, reservations]
  );

  const filteredPayouts = useMemo(
    () =>
      payouts.filter(
        (payout) =>
          payoutStatus === "all" || payout.payout_status === payoutStatus
      ),
    [payoutStatus, payouts]
  );

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

    const { data: userRows, error: usersError } =
      await supabase.rpc("get_admin_users");

    if (usersError) {
      setErrorMessage(usersError.message);
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
    const adminUsers = (userRows ?? []) as AdminUser[];
    setUsers(adminUsers);
    setUserRoles(
      adminUsers.reduce<Record<string, string>>((values, user) => {
        values[user.id] = user.role;
        return values;
      }, {})
    );
    setUserPoints(
      adminUsers.reduce<Record<string, string>>((values, user) => {
        values[user.id] = user.collection_point_id ?? "";
        return values;
      }, {})
    );
    setReservations((reservationRows ?? []) as AdminReservation[]);
    setPayouts((payoutRows ?? []) as AdminPayout[]);
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

  async function updateUserRole(userId: string) {
    const role = userRoles[userId];
    const collectionPointId = userPoints[userId] || null;

    if (role === "verifier" && !collectionPointId) {
      setErrorMessage("Select a collection point before promoting this user to verifier.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.rpc("admin_update_user_role", {
      target_profile_id: userId,
      target_role: role,
      target_collection_point_id: collectionPointId,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("User role and access assignment updated.");
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

  function exportAdminWorkbook() {
    const workbook = XLSX.utils.book_new();
    const exportedAt = new Date().toLocaleString("en-GB");

    if (selectedExports.points) {
      const rows = points.map((point) => ({
        "Collection point": point.name,
        Location: point.location,
        Status: point.is_active ? "Active" : "Inactive",
        "Pending collections": point.pendingCount,
      }));
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(rows),
        "Collection points"
      );
    }

    if (selectedExports.users) {
      const rows = users.map((user) => ({
        Name: user.full_name || "Unnamed user",
        Phone: user.phone || "",
        Role: user.role,
        "Collection point":
          points.find((point) => point.id === user.collection_point_id)
            ?.location || "",
      }));
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(rows),
        "User roles"
      );
    }

    if (selectedExports.handoffs) {
      const rows = reservations.map((reservation) => ({
        Recycler: reservation.recycler_name,
        Material: reservation.material,
        "Verified weight (kg)": Number(reservation.verified_weight ?? 0),
        Location: reservation.location || "",
        Status: reservation.status,
      }));
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(rows),
        "Material handoffs"
      );
    }

    if (selectedExports.payouts) {
      const rows = payouts.map((payout) => ({
        Collector: payout.collector_name,
        Material: payout.material,
        "Verified weight (kg)": Number(payout.verified_weight ?? 0),
        Earnings: Number(payout.earnings ?? 0),
        Status: payout.payout_status,
      }));
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(rows),
        "Collector payouts"
      );
    }

    if (workbook.SheetNames.length === 0) {
      setErrorMessage("Select at least one export section.");
      return;
    }

    XLSX.writeFile(
      workbook,
      `drop2earn-admin-export-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    setSuccessMessage(`Excel export created successfully at ${exportedAt}.`);
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
              Export admin data
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose the sections to include in an Excel workbook.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["points", "Active collection points"],
                  ["users", "User roles"],
                  ["handoffs", "Material handoffs"],
                  ["payouts", "Collector payouts"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedExports[key]}
                    onChange={(event) =>
                      setSelectedExports((current) => ({
                        ...current,
                        [key]: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-green-600"
                  />
                  {label}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={exportAdminWorkbook}
              disabled={loading}
              className="mt-5 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              Download Excel workbook
            </button>
          </section>

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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Collection points
                </h2>
                <input
                  value={pointSearch}
                  onChange={(event) => setPointSearch(event.target.value)}
                  placeholder="Search points"
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
            {loading ? (
              <p className="p-8 text-center text-gray-500">Loading points...</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredPoints.map((point) => (
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
                {filteredPoints.length === 0 && (
                  <p className="p-6 text-gray-500">No collection points match your search.</p>
                )}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    User management
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage roles and assign verifier access without editing profiles manually.
                  </p>
                </div>
                <input
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search users"
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
            {users.length === 0 ? (
              <p className="p-6 text-gray-500">No user profiles found.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {user.full_name || "Unnamed user"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {user.phone || "No phone number"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <select
                        value={userRoles[user.id] ?? user.role}
                        onChange={(event) =>
                          setUserRoles((current) => ({
                            ...current,
                            [user.id]: event.target.value,
                          }))
                        }
                        className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
                      >
                        <option value="collector">Collector</option>
                        <option value="recycler">Recycler</option>
                        <option value="verifier">Verifier</option>
                        <option value="admin">Admin</option>
                      </select>
                      {(userRoles[user.id] ?? user.role) === "verifier" && (
                        <select
                          value={userPoints[user.id] ?? ""}
                          onChange={(event) =>
                            setUserPoints((current) => ({
                              ...current,
                              [user.id]: event.target.value,
                            }))
                          }
                          className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
                        >
                          <option value="">Verifier collection point</option>
                          {points
                            .filter((point) => point.is_active)
                            .map((point) => (
                              <option key={point.id} value={point.id}>
                                {point.location}
                              </option>
                            ))}
                            {filteredUsers.length === 0 && (
                              <p className="p-6 text-gray-500">No users match your search.</p>
                            )}
                        </select>
                      )}
                      {(
                        userRoles[user.id] !== user.role ||
                        (userRoles[user.id] === "verifier" &&
                          (userPoints[user.id] ?? "") !==
                            (user.collection_point_id ?? ""))
                      ) ? (
                        <button
                          type="button"
                          onClick={() => void updateUserRole(user.id)}
                          disabled={saving}
                          className="rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Save access
                        </button>
                      ) : (
                        <span className="self-center text-sm font-medium text-green-700">
                          Access saved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Material handoffs
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Confirm pickup requests after the physical handoff is complete.
                  </p>
                </div>
                <select
                  value={handoffStatus}
                  onChange={(event) => setHandoffStatus(event.target.value)}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900"
                >
                  <option value="all">All statuses</option>
                  <option value="pickup_requested">Pickup requested</option>
                  <option value="completed">Completed</option>
                  <option value="reserved">Reserved</option>
                  <option value="released">Released</option>
                </select>
              </div>
            </div>
            {filteredReservations.length === 0 ? (
              <p className="p-6 text-gray-500">No reservations yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredReservations.map((reservation) => (
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Collector payouts
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Pending payouts appear after a completed material handoff.
                    Mark verified earnings as paid once the collector has been paid.
                  </p>
                </div>
                <select
                  value={payoutStatus}
                  onChange={(event) => setPayoutStatus(event.target.value)}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900"
                >
                  <option value="all">All payouts</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            {filteredPayouts.length === 0 ? (
              <p className="p-6 text-gray-500">No verified earnings yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredPayouts.map((payout) => (
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
