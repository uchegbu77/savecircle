"use client";

import { useActionState } from "react";

import {
  joinCircle,
  type JoinCircleState,
} from "../app/circles/join/actions";

const initialState: JoinCircleState =
  {};

export default function JoinCircleForm() {
  const [state, formAction, pending] =
    useActionState(
      joinCircle,
      initialState,
    );

  return (
    <form
      action={formAction}
      className="mt-8 space-y-6"
    >
      <div>
        <label
          htmlFor="inviteCode"
          className="block text-sm font-semibold text-slate-700"
        >
          Invite code
        </label>

        <input
          id="inviteCode"
          name="inviteCode"
          type="text"
          required
          maxLength={8}
          autoComplete="off"
          placeholder="9TK3WQ8M"
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-4 text-center text-xl font-bold uppercase tracking-[0.2em] text-slate-900 outline-none transition placeholder:tracking-normal placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />

        <p className="mt-2 text-sm text-slate-500">
          Enter the 8-character code shared by the circle owner.
        </p>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Joining circle..."
          : "Join savings circle"}
      </button>
    </form>
  );
}