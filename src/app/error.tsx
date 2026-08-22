"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      "SaveCircle application error:",
      error,
    );
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
          !
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Something went wrong
        </h1>

        <p className="mt-3 leading-7 text-slate-600">
          SaveCircle could not complete this request.
          Please try again.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}