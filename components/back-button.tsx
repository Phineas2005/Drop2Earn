"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  fallback?: string;
};

export function BackButton({ fallback = "/" }: BackButtonProps) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
      aria-label="Go back to the previous page"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}
