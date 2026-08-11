"use client";

import { useActionState } from "react";

import {
  type CircleSettingsState,
  updateCircleSettings,
} from "../app/circles/[id]/settings/actions";

type CircleSettingsFormProps = {
  circleId: string;
  name: string;
  description: string;
  contributionAmount: string;
  frequency: "WEEKLY" | "MONTHLY";
  startDate: string;
  maxMembers: number;
};

const initialState: CircleSettingsState =
  {};

export default function CircleSettingsForm({
  circleId,
  name,
  description,
  contributionAmount,
  frequency,
  startDate,
  maxMembers,
}: CircleSettingsFormProps) {
  const action =
    updateCircleSettings.bind(
      null,
      circleId,
    );

  const [state, formAction, pending] =
    useActionState(
      action,
      initialState,
    );

  return (
    <form
      action={formAction}
      className="space-y-6"
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
          defaultValue={name}
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
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
          defaultValue={
            description
          }
          className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label
          htmlFor="contributionAmount"
          className="block text-sm font-semibold text-slate-700"
        >
          Contribution amount
        </label>

        <input
          id="contributionAmount"
          name="contributionAmount"
          type="number"
          min="1"
          step="0.01"
          required
          defaultValue={
            contributionAmount
          }
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
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
          defaultValue={frequency}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="WEEKLY">
            Weekly
          </option>

          <option value="MONTHLY">
            Monthly
          </option>
        </select>
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
          defaultValue={startDate}
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label
          htmlFor="maxMembers"
          className="block text-sm font-semibold text-slate-700"
        >
          Maximum members
        </label>

        <input
          id="maxMembers"
          name="maxMembers"
          type="number"
          min="2"
          max="50"
          required
          defaultValue={
            maxMembers
          }
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
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
        className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending
          ? "Saving changes..."
          : "Save settings"}
      </button>
    </form>
  );
}