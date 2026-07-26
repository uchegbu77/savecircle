"use client";

import { useActionState } from "react";

import {
  startCircle,
  type StartCircleState,
} from "../app/circles/[id]/start-actions";

type StartCircleFormProps = {
  circleId: string;
  activeMemberCount: number;
  maximumMemberCount: number;
  allPositionsAssigned: boolean;
};

const initialState: StartCircleState =
  {};

export default function StartCircleForm({
  circleId,
  activeMemberCount,
  maximumMemberCount,
  allPositionsAssigned,
}: StartCircleFormProps) {
  const action = startCircle.bind(
    null,
    circleId,
  );

  const [state, formAction, pending] =
    useActionState(
      action,
      initialState,
    );

  const circleIsFull =
    activeMemberCount ===
    maximumMemberCount;

  const canStart =
    circleIsFull &&
    allPositionsAssigned;

  return (
    <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <p className="font-semibold text-amber-900">
        Start savings circle
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        Activate the contribution schedule
      </h2>

      <p className="mt-3 leading-7 text-slate-700">
        Starting the circle will generate all contribution cycles and lock the payout order.
      </p>

      <div className="mt-6 space-y-3">
        <Requirement
          complete={circleIsFull}
          text={`${activeMemberCount} of ${maximumMemberCount} members have joined`}
        />

        <Requirement
          complete={
            allPositionsAssigned
          }
          text="Every active member has a payout position"
        />
      </div>

      {!canStart && (
        <p className="mt-5 rounded-lg bg-white p-4 text-sm text-amber-900">
          Complete all requirements before starting the circle.
        </p>
      )}

      <form
        action={formAction}
        className="mt-6"
      >
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="confirmation"
            value="confirmed"
            required
            disabled={!canStart}
            className="mt-1 h-4 w-4 accent-emerald-600"
          />

          <span>
            I have reviewed the members, contribution amount, start date and payout order.
          </span>
        </label>

        {state.error && (
          <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={
            pending || !canStart
          }
          className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Starting circle..."
            : "Start savings circle"}
        </button>
      </form>
    </section>
  );
}

type RequirementProps = {
  complete: boolean;
  text: string;
};

function Requirement({
  complete,
  text,
}: RequirementProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
          complete
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {complete ? "✓" : "—"}
      </span>

      <span
        className={
          complete
            ? "text-emerald-900"
            : "text-slate-600"
        }
      >
        {text}
      </span>
    </div>
  );
}