import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";

export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const contributions =
    await prisma.contribution.findMany({
      where: {
        member: {
          userId: user.id,
        },
      },

      include: {
        cycle: {
          include: {
            savingsCircle: true,

            payoutRecipient: {
              include: {
                user: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const totalDue =
    contributions.reduce(
      (total, contribution) =>
        total +
        Number(contribution.amountDue),
      0,
    );

  const totalPaid =
    contributions.reduce(
      (total, contribution) =>
        total +
        Number(contribution.amountPaid),
      0,
    );

  const outstanding =
    contributions.reduce(
      (total, contribution) => {
        const remaining =
          Number(contribution.amountDue) -
          Number(contribution.amountPaid);

        return total + Math.max(0, remaining);
      },
      0,
    );

  const paidContributions =
    contributions.filter(
      (contribution) =>
        contribution.status === "PAID",
    );

  const pendingContributions =
    contributions.filter(
      (contribution) =>
        contribution.status !== "PAID",
    );

  const completedPayouts =
    await prisma.contributionCycle.findMany({
      where: {
        payoutRecipient: {
          userId: user.id,
        },

        payoutStatus: "COMPLETED",
      },

      include: {
        savingsCircle: true,
      },

      orderBy: {
        payoutCompletedAt: "desc",
      },
    });

  const totalReceived =
    completedPayouts.reduce(
      (total, payout) =>
        total +
        Number(payout.expectedAmount),
      0,
    );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          ← Dashboard
        </Link>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold text-emerald-600">
              Reports
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Savings report
            </h1>

            <p className="mt-3 text-slate-600">
              Contribution and payout records for{" "}
              <span className="font-semibold text-slate-900">
                {user.firstName} {user.lastName}
              </span>
              .
            </p>
          </div>

          <a
            href="/api/reports/contributions"
            className="rounded-lg bg-emerald-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-emerald-700"
          >
            Download contributions CSV
          </a>
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total due"
            value={formatCurrency(totalDue)}
          />

          <SummaryCard
            label="Total contributed"
            value={formatCurrency(totalPaid)}
          />

          <SummaryCard
            label="Outstanding"
            value={formatCurrency(outstanding)}
          />

          <SummaryCard
            label="Total payouts received"
            value={formatCurrency(totalReceived)}
          />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Contribution history
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {paidContributions.length} paid ·{" "}
                  {pendingContributions.length} outstanding
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-600">
                {contributions.length} total records
              </p>
            </div>
          </div>

          {contributions.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-bold text-slate-900">
                No contributions yet
              </h3>

              <p className="mt-2 text-slate-600">
                Your contribution history will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {contributions.map(
                (contribution) => {
                  const outstandingAmount =
                    Math.max(
                      0,
                      Number(
                        contribution.amountDue,
                      ) -
                        Number(
                          contribution.amountPaid,
                        ),
                    );

                  return (
                    <article
                      key={contribution.id}
                      className="p-6"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900">
                              {
                                contribution.cycle
                                  .savingsCircle
                                  .name
                              }
                            </h3>

                            <StatusBadge
                              status={
                                contribution.status
                              }
                            />
                          </div>

                          <p className="mt-2 text-sm text-slate-600">
                            Cycle{" "}
                            {
                              contribution.cycle
                                .cycleNumber
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Scheduled payout recipient:{" "}
                            {
                              contribution.cycle
                                .payoutRecipient
                                .user.firstName
                            }{" "}
                            {
                              contribution.cycle
                                .payoutRecipient
                                .user.lastName
                            }
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="font-bold text-slate-900">
                            Paid:{" "}
                            {formatCurrency(
                              Number(
                                contribution.amountPaid,
                              ),
                            )}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Due:{" "}
                            {formatCurrency(
                              Number(
                                contribution.amountDue,
                              ),
                            )}
                          </p>

                          {outstandingAmount >
                            0 && (
                            <p className="mt-1 text-sm font-semibold text-amber-700">
                              Outstanding:{" "}
                              {formatCurrency(
                                outstandingAmount,
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                        <span>
                          Due date:{" "}
                          {formatDate(
                            contribution.cycle
                              .scheduledDate,
                          )}
                        </span>

                        {contribution.paidAt && (
                          <span>
                            Paid:{" "}
                            {formatDate(
                              contribution.paidAt,
                            )}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/circles/${contribution.cycle.savingsCircleId}/cycles/${contribution.cycleId}`}
                        className="mt-4 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                      >
                        View contribution →
                      </Link>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Payouts received
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Completed payouts where you were the scheduled recipient.
            </p>
          </div>

          {completedPayouts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-600">
                You have not received a completed payout yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {completedPayouts.map(
                (payout) => (
                  <article
                    key={payout.id}
                    className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {
                          payout
                            .savingsCircle
                            .name
                        }
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
                        Cycle{" "}
                        {
                          payout.cycleNumber
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {payout.payoutCompletedAt
                          ? `Completed ${formatDate(
                              payout.payoutCompletedAt,
                            )}`
                          : "Completion date unavailable"}
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(
                        Number(
                          payout.expectedAmount,
                        ),
                      )}
                    </p>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </div>
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
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const style =
    status === "PAID"
      ? "bg-emerald-100 text-emerald-700"
      : status === "LATE" ||
          status === "MISSED"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-800";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatCurrency(
  amount: number,
) {
  return new Intl.NumberFormat(
    "en-GB",
    {
      style: "currency",
      currency: "GBP",
    },
  ).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatStatus(
  value: string,
) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}