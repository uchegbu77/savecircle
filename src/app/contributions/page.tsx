import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";

export default async function ContributionsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },

      include: {
        circleMemberships: {
          where: {
            status: "ACTIVE",
          },

          include: {
            contributions: {
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
                cycle: {
                  scheduledDate:
                    "asc",
                },
              },
            },
          },
        },
      },
    });

  if (!user) {
    redirect("/login");
  }

  const contributions =
    user.circleMemberships.flatMap(
      (membership) =>
        membership.contributions,
    );

  const totalDue =
    contributions.reduce(
      (total, contribution) =>
        total +
        Number(
          contribution.amountDue,
        ),
      0,
    );

  const totalPaid =
    contributions.reduce(
      (total, contribution) =>
        total +
        Number(
          contribution.amountPaid,
        ),
      0,
    );

  const outstanding =
    totalDue - totalPaid;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          ← Dashboard
        </Link>

        <div className="mt-6">
          <p className="font-semibold text-emerald-600">
            Personal records
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            My contributions
          </h1>

          <p className="mt-3 text-slate-600">
            View your payment history and upcoming obligations.
          </p>
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <SummaryCard
            label="Total due"
            value={`£${totalDue.toFixed(
              2,
            )}`}
          />

          <SummaryCard
            label="Total paid"
            value={`£${totalPaid.toFixed(
              2,
            )}`}
          />

          <SummaryCard
            label="Outstanding"
            value={`£${outstanding.toFixed(
              2,
            )}`}
          />
        </section>

        {contributions.length === 0 ? (
          <section className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              No contributions yet
            </h2>

            <p className="mt-3 text-slate-600">
              Your contribution records will appear after one of your circles starts.
            </p>
          </section>
        ) : (
          <section className="mt-10 space-y-5">
            {contributions.map(
              (contribution) => {
                const cycle =
                  contribution.cycle;

                return (
                  <article
                    key={
                      contribution.id
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-emerald-600">
                          {
                            cycle
                              .savingsCircle
                              .name
                          }
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                          Cycle{" "}
                          {
                            cycle.cycleNumber
                          }
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                          Payout recipient:{" "}
                          {
                            cycle
                              .payoutRecipient
                              .user
                              .firstName
                          }{" "}
                          {
                            cycle
                              .payoutRecipient
                              .user
                              .lastName
                          }
                        </p>
                      </div>

                      <ContributionStatus
                        status={
                          contribution.status
                        }
                      />
                    </div>

                    <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
                      <Detail
                        label="Due date"
                        value={cycle.scheduledDate.toLocaleDateString(
                          "en-GB",
                        )}
                      />

                      <Detail
                        label="Amount due"
                        value={`£${Number(
                          contribution.amountDue,
                        ).toFixed(2)}`}
                      />

                      <Detail
                        label="Amount paid"
                        value={`£${Number(
                          contribution.amountPaid,
                        ).toFixed(2)}`}
                      />

                      <Detail
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

                    <Link
                      href={`/circles/${cycle.savingsCircleId}/cycles/${cycle.id}`}
                      className="mt-6 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      View cycle →
                    </Link>
                  </article>
                );
              },
            )}
          </section>
        )}
      </div>
    </main>
  );
}

type DisplayProps = {
  label: string;
  value: string;
};

function SummaryCard({
  label,
  value,
}: DisplayProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: DisplayProps) {
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

function ContributionStatus({
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
      {status
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(
          /\b\w/g,
          (character) =>
            character.toUpperCase(),
        )}
    </span>
  );
}