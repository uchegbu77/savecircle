"use client";

import { useActionState } from "react";

import {
  markContributionPaid,
  type ContributionActionState,
} from "../app/circles/[id]/cycles/[cycleId]/actions";

type ContributionPaymentFormProps = {
  circleId: string;
  cycleId: string;
  contributionId: string;
  memberName: string;
  amountDue: string;
};

const initialState: ContributionActionState =
  {};

export default function ContributionPaymentForm({
  circleId,
  cycleId,
  contributionId,
  memberName,
  amountDue,
}: ContributionPaymentFormProps) {
  const action =
    markContributionPaid.bind(
      null,
      circleId,
      cycleId,
      contributionId,
    );

  const [state, formAction, pending] =
    useActionState(
      action,
      initialState,
    );

  return (
    <form
      action={formAction}
      className="rounded-xl border border-slate-200 bg-slate-50 p-5"
    >
      <div>
        <p className="font-semibold text-slate-900">
          Record payment for {memberName}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          Amount due: £{amountDue}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`reference-${contributionId}`}
            className="block text-sm font-semibold text-slate-700"
          >
            Payment reference
          </label>

          <input
            id={`reference-${contributionId}`}
            name="reference"
            type="text"
            maxLength={100}
            placeholder="Bank transfer reference"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label
            htmlFor={`notes-${contributionId}`}
            className="block text-sm font-semibold text-slate-700"
          >
            Notes
          </label>

          <input
            id={`notes-${contributionId}`}
            name="notes"
            type="text"
            maxLength={250}
            placeholder="Optional note"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {state.error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Recording payment..."
          : "Mark as paid"}
      </button>
    </form>
  );
}