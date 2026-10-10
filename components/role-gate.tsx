"use client";

import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { BrandedLoader } from "@/components/branded-loader";

type RoleGateProps = {
  allowedRoles: string[];
  children: ReactNode;
};

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const allowedRoleKey = allowedRoles.join("|");
  const [status, setStatus] = useState<"checking" | "allowed" | "error">(
    "checking"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setErrorMessage(
          "The account check timed out. Refresh the page and try again."
        );
        setStatus("error");
      }
    }, 10000);

    async function checkAccess() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          window.location.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        if (cancelled) return;

        if (!allowedRoleKey.split("|").includes(profile.role)) {
          const destination =
            profile.role === "recycler"
              ? "/recycler"
              : profile.role === "verifier" || profile.role === "admin"
                ? "/verification"
                : "/dashboard";
          window.location.replace(destination);
          return;
        }

        window.clearTimeout(timeout);
        setStatus("allowed");
      } catch (error: unknown) {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not verify your account access."
        );
        window.clearTimeout(timeout);
        setStatus("error");
      }
    }

    void checkAccess();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [allowedRoleKey]);

  if (status === "checking") {
    return (
      <BrandedLoader
        message="Preparing your workspace"
        detail="Securely checking your Drop2Earn access..."
      />
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="font-bold text-red-900">Could not verify access</h1>
          <p className="mt-2 text-sm text-red-800">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return children;
}
