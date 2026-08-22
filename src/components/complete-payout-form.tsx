"use client";

import { useActionState } from "react";

import {
  completePayout,
  type CompletePayoutState,
} from "../app/circles/[id]/cycles/[cycleId]/payout-actions";

type CompletePayoutFormProps = {
  circleId: string;
  cycleId: string;
  recipientName: string;
  payoutAmount: string;
};

const initialState: CompletePayoutState = {};

export default function CompletePayoutForm({
  circleId,
  cycleId,
  recipientName,
  payoutAmount,
}: CompletePayoutFormProps) {
  const action = completePayout.bind(
    null,
    circleId,
    cycleId,
  );

  const [state, formAction, pending] =
    useActionState(action, initialState);

  return (
    <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
      <p className="font-semibold text-emerald-700">
        Payout ready
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        Confirm payout completion
      </h2>

      <p className="mt-3 leading-7 text-slate-700">
        Confirm that £{payoutAmount} has been paid to{" "}
        <span className="font-semibold">
          {recipientName}
        </span>
        .
      </p>

      <form
        action={formAction}
        className="mt-6 space-y-5"
      >
        <div>
          <label
            htmlFor="payoutReference"
            className="block text-sm font-semibold text-slate-700"
          >
            Payout reference
          </label>

          <input
            id="payoutReference"
            name="payoutReference"
            type="text"
            maxLength={100}
            placeholder="Bank transfer or payment reference"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />

          <p className="mt-2 text-sm text-slate-500">
            Optional, but recommended for record keeping.
          </p>
        </div>

        <div>
          <label
            htmlFor="payoutNotes"
            className="block text-sm font-semibold text-slate-700"
          >
            Payout notes
          </label>

          <textarea
            id="payoutNotes"
            name="payoutNotes"
            rows={4}
            maxLength={500}
            placeholder="Add any useful details about the payout"
            className="mt-2 w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="confirmation"
            value="confirmed"
            required
            className="mt-1 h-4 w-4 accent-emerald-600"
          />

          <span>
            I confirm that the full payout has been sent to the
            scheduled recipient.
          </span>
        </label>

          {state.error && (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {state.error}
            </p>
          )}

        {state.success && (
          <p
            role="status"
            aria-live="polite"
            className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Completing payout..."
            : "Confirm payout completed"}
        </button>
      </form>
    </section>
  );
}