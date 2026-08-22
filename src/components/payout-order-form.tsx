"use client";

import { useActionState } from "react";

import {
  type PayoutOrderState,
  updatePayoutOrder,
} from "../app/circles/[id]/payout-order/actions";

type Member = {
  id: string;

  user: {
    firstName: string;
    lastName: string;
    email: string;
  };

  role: string;

  payoutPosition:
    number | null;
};

type PayoutOrderFormProps = {
  circleId: string;
  members: Member[];
  canEdit: boolean;
};

const initialState: PayoutOrderState =
  {};

export default function PayoutOrderForm({
  circleId,
  members,
  canEdit,
}: PayoutOrderFormProps) {
  const action =
    updatePayoutOrder.bind(
      null,
      circleId,
    );

  const [state, formAction, pending] =
    useActionState(
      action,
      initialState,
    );

  const sortedMembers =
    [...members].sort(
      (first, second) => {
        if (
          first.payoutPosition === null
        ) {
          return 1;
        }

        if (
          second.payoutPosition === null
        ) {
          return -1;
        }

        return (
          first.payoutPosition -
          second.payoutPosition
        );
      },
    );

  if (!canEdit) {
    return (
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
        {sortedMembers.map(
          (member) => (
            <article
              key={member.id}
              className="flex items-center gap-4 border-b border-slate-200 p-5 last:border-b-0"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                {member.payoutPosition ??
                  "—"}
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  {
                    member.user
                      .firstName
                  }{" "}
                  {
                    member.user
                      .lastName
                  }
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {member.role}
                </p>
              </div>
            </article>
          ),
        )}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-6"
    >
      <div className="overflow-hidden rounded-xl border border-slate-200">
        {members.map(
          (member) => (
            <div
              key={member.id}
              className="grid gap-4 border-b border-slate-200 p-5 last:border-b-0 sm:grid-cols-[1fr_180px] sm:items-center"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {
                    member.user
                      .firstName
                  }{" "}
                  {
                    member.user
                      .lastName
                  }
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {member.user.email}
                </p>
              </div>

              <div>
                <label
                  htmlFor={`position-${member.id}`}
                  className="block text-sm font-semibold text-slate-700"
                >
                  Payout position
                </label>

                <select
                  id={`position-${member.id}`}
                  name={`position-${member.id}`}
                  defaultValue={
                    member.payoutPosition?.toString() ??
                    ""
                  }
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select
                  </option>

                  {members.map(
                    (
                      unusedMember,
                      index,
                    ) => (
                      <option
                        key={
                          unusedMember.id
                        }
                        value={
                          index + 1
                        }
                      >
                        Position{" "}
                        {index + 1}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          ),
        )}
      </div>

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
        className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Saving order..."
          : "Save payout order"}
      </button>
    </form>
  );
}