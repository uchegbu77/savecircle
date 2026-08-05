import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { auth } from "../../../../../auth";
import ContributionPaymentForm from "../../../../../components/contribution-payment-form";
import { prisma } from "../../../../../lib/prisma";

import {
  resetContributionPayment,
} from "./actions";
import CompletePayoutForm from "@/src/components/complete-payout-form";

type CycleDetailsPageProps = {
  params: Promise<{
    id: string;
    cycleId: string;
  }>;
};

export default async function CycleDetailsPage({
  params,
}: CycleDetailsPageProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { id, cycleId } =
    await params;

  const cycle =
    await prisma.contributionCycle.findFirst({
      where: {
        id: cycleId,
        savingsCircleId: id,

        savingsCircle: {
          members: {
            some: {
              status: "ACTIVE",

              user: {
                email:
                  session.user.email,
              },
            },
          },
        },
      },

      include: {
        savingsCircle: {
          include: {
            owner: true,
          },
        },

        payoutRecipient: {
          include: {
            user: true,
          },
        },

        contributions: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },

          orderBy: {
            member: {
              payoutPosition: "asc",
            },
          },
        },
      },
    });

  if (!cycle) {
    notFound();
  }

  const isOwner =
    cycle.savingsCircle.owner
      .email ===
    session.user.email;

    const canCompletePayout = isOwner &&
  cycle.status === "COMPLETED" &&
  cycle.payoutStatus === "READY";

  const payoutRecipientName =
  `${cycle.payoutRecipient.user.firstName} ${cycle.payoutRecipient.user.lastName}`;

  const totalPaid =
    cycle.contributions.reduce(
      (total, contribution) =>
        total +
        Number(
          contribution.amountPaid,
        ),
      0,
    );

  const expectedAmount =
    Number(cycle.expectedAmount);

  const progress =
    expectedAmount > 0
      ? Math.min(
          100,
          Math.round(
            (totalPaid /
              expectedAmount) *
              100,
          ),
        )
      : 0;

  const paidCount =
    cycle.contributions.filter(
      (contribution) =>
        contribution.status ===
        "PAID",
    ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/circles/${id}/cycles`}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          ← Back to contribution cycles
        </Link>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-semibold text-emerald-600">
                Cycle {cycle.cycleNumber}
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Contribution tracking
              </h1>

              <p className="mt-3 text-slate-600">
                Payout recipient:{" "}
                <span className="font-semibold text-slate-900">
                  {
                    cycle
                      .payoutRecipient
                      .user.firstName
                  }{" "}
                  {
                    cycle
                      .payoutRecipient
                      .user.lastName
                  }
                </span>
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Scheduled for{" "}
                {cycle.scheduledDate.toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusBadge
                label="Cycle"
                status={cycle.status}
              />

              <StatusBadge
                label="Payout"
                status={
                  cycle.payoutStatus
                }
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Expected pool"
              value={`£${expectedAmount.toFixed(
                2,
              )}`}
            />

            <SummaryCard
              label="Collected"
              value={`£${totalPaid.toFixed(
                2,
              )}`}
            />

            <SummaryCard
              label="Members paid"
              value={`${paidCount} of ${cycle.contributions.length}`}
            />
          </div>

          <div className="mt-7">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-600">
                Collection progress
              </span>

              <span className="font-semibold text-slate-900">
                {progress}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div>
            <p className="font-semibold text-emerald-600">
              Payment records
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Member contributions
            </h2>
          </div>

          <div className="mt-6 space-y-5">
            {cycle.contributions.map(
              (contribution) => {
                const memberName =
                  `${contribution.member.user.firstName} ${contribution.member.user.lastName}`;

                const resetAction =
                  resetContributionPayment.bind(
                    null,
                    id,
                    cycle.id,
                    contribution.id,
                  );

                return (
                  <article
                    key={
                      contribution.id
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {memberName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            contribution
                              .member.user
                              .email
                          }
                        </p>
                      </div>

                      <ContributionBadge
                        status={
                          contribution.status
                        }
                      />
                    </div>

                    <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                      <ContributionDetail
                        label="Amount due"
                        value={`£${Number(
                          contribution.amountDue,
                        ).toFixed(2)}`}
                      />

                      <ContributionDetail
                        label="Amount paid"
                        value={`£${Number(
                          contribution.amountPaid,
                        ).toFixed(2)}`}
                      />

                      <ContributionDetail
                        label="Payment date"
                        value={
                          contribution.paidAt
                            ? contribution.paidAt.toLocaleDateString(
                                "en-GB",
                              )
                            : "Not paid"
                        }
                      />
                    </dl>

                    {contribution.reference && (
                      <p className="mt-4 text-sm text-slate-600">
                        Reference:{" "}
                        <span className="font-medium text-slate-900">
                          {
                            contribution.reference
                          }
                        </span>
                      </p>
                    )}

                    {contribution.notes && (
                      <p className="mt-2 text-sm text-slate-600">
                        Notes:{" "}
                        {contribution.notes}
                      </p>
                    )}

                    {isOwner &&
                      contribution.status !==
                        "PAID" &&
                      cycle.status !==
                        "COMPLETED" && (
                        <div className="mt-6">
                          <ContributionPaymentForm
                            circleId={id}
                            cycleId={
                              cycle.id
                            }
                            contributionId={
                              contribution.id
                            }
                            memberName={
                              memberName
                            }
                            amountDue={Number(
                              contribution.amountDue,
                            ).toFixed(2)}
                          />
                        </div>
                      )}

                    {isOwner &&
                      contribution.status ===
                        "PAID" &&
                      cycle.payoutStatus !==
                        "COMPLETED" && (
                        <form
                          action={
                            resetAction
                          }
                          className="mt-6"
                        >
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Reset payment
                          </button>
                        </form>
                      )}
                  </article>
                );
              },
            )}
          </div>
        </section>
      </div>

      {canCompletePayout && (
        <CompletePayoutForm
          circleId={cycle.savingsCircleId}
          cycleId={cycle.id}
          recipientName={payoutRecipientName}
          payoutAmount={Number(cycle.expectedAmount).toFixed(2)}
        />
      )}

      {cycle.payoutStatus === "COMPLETED" && (
  <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
    <p className="font-semibold text-blue-700">
      Payout completed
    </p>

    <h2 className="mt-2 text-2xl font-bold text-slate-900">
      Funds paid to {payoutRecipientName}
    </h2>

    <p className="mt-3 text-slate-700">
      £{Number(cycle.expectedAmount).toFixed(2)} was confirmed as paid.
    </p>

    <dl className="mt-6 grid gap-5 border-t border-blue-200 pt-6 sm:grid-cols-3">
      <PayoutDetail
        label="Recipient"
        value={payoutRecipientName}
      />

      <PayoutDetail
        label="Completion date"
        value={
          cycle.payoutCompletedAt
            ? cycle.payoutCompletedAt.toLocaleDateString(
                "en-GB",
              )
            : "Not recorded"
        }
      />

      <PayoutDetail
        label="Reference"
        value={
          cycle.payoutReference ||
          "No reference provided"
        }
      />
    </dl>

    {cycle.payoutNotes && (
      <div className="mt-5 rounded-xl bg-white p-4">
        <p className="text-sm font-semibold text-slate-700">
          Notes
        </p>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {cycle.payoutNotes}
        </p>
      </div>
    )}
  </section>
)}
    </main>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
};

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

type PayoutDetailProps = {
  label: string;
  value: string;
};

function PayoutDetail({
  label,
  value,
}: PayoutDetailProps) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  );
}

type ContributionDetailProps = {
  label: string;
  value: string;
};

function ContributionDetail({
  label,
  value,
}: ContributionDetailProps) {
  return (
    <div>
      <dt className="text-sm text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function StatusBadge({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      {label}: {formatStatus(status)}
    </span>
  );
}

function ContributionBadge({
  status,
}: {
  status: string;
}) {
  const styles =
    status === "PAID"
      ? "bg-emerald-100 text-emerald-700"
      : status === "LATE"
        ? "bg-amber-100 text-amber-800"
        : status === "MISSED"
          ? "bg-red-100 text-red-700"
          : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(
  status: string,
) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}