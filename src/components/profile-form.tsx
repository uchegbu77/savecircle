"use client";

import { useActionState } from "react";

import {
  type ProfileActionState,
  updateProfile,
} from "../app/account/actions";

type ProfileFormProps = {
  firstName: string;
  lastName: string;
  email: string;
};

const initialState: ProfileActionState =
  {};

export default function ProfileForm({
  firstName,
  lastName,
  email,
}: ProfileFormProps) {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    updateProfile,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-semibold text-slate-700"
          >
            First name
          </label>

          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            minLength={2}
            maxLength={50}
            defaultValue={firstName}
            autoComplete="given-name"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-semibold text-slate-700"
          >
            Last name
          </label>

          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            minLength={2}
            maxLength={50}
            defaultValue={lastName}
            autoComplete="family-name"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-slate-700"
        >
          Email address
        </label>

        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
        />

        <p className="mt-2 text-sm text-slate-500">
          Email changes are not enabled in this version of SaveCircle.
        </p>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Saving..."
          : "Save profile"}
      </button>
    </form>
  );
}