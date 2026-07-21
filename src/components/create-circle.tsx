"use client";

import { useActionState } from "react";

import {
  createCircle,
  type CreateCircleState,
} from "../app/circles/create/actions";

const initialState: CreateCircleState = {};

export default function CreateCircleForm() {
  const [state, formAction, pending] =
    useActionState(
      createCircle,
      initialState,
    );

  return (
    <form
      action={formAction}
      className="mt-8 space-y-6"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-slate-700"
        >
          Circle name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Family Growth Circle"
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />

        {state.errors?.name && (
          <p className="mt-2 text-sm text-red-600">
            {state.errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-slate-700"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="What is this savings circle for?"
          className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label
          htmlFor="contributionAmount"
          className="block text-sm font-semibold text-slate-700"
        >
          Contribution amount
        </label>

        <div className="mt-2 flex rounded-lg border border-slate-300 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
          <span className="flex items-center border-r border-slate-300 px-4 text-slate-500">
            £
          </span>

          <input
            id="contributionAmount"
            name="contributionAmount"
            type="number"
            min="1"
            step="0.01"
            required
            placeholder="100"
            className="w-full rounded-r-lg px-4 py-3 text-slate-900 outline-none"
          />
        </div>

        {state.errors?.contributionAmount && (
          <p className="mt-2 text-sm text-red-600">
            {
              state.errors
                .contributionAmount
            }
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="frequency"
          className="block text-sm font-semibold text-slate-700"
        >
          Contribution frequency
        </label>

        <select
          id="frequency"
          name="frequency"
          required
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="" disabled>
            Select frequency
          </option>

          <option value="WEEKLY">
            Weekly
          </option>

          <option value="MONTHLY">
            Monthly
          </option>
        </select>

        {state.errors?.frequency && (
          <p className="mt-2 text-sm text-red-600">
            {state.errors.frequency}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="startDate"
          className="block text-sm font-semibold text-slate-700"
        >
          Start date
        </label>

        <input
          id="startDate"
          name="startDate"
          type="date"
          required
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />

        {state.errors?.startDate && (
          <p className="mt-2 text-sm text-red-600">
            {state.errors.startDate}
          </p>
        )}
      </div>

      {state.message && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Creating circle..."
          : "Create savings circle"}
      </button>
    </form>
  );
}