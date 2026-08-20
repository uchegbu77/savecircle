import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { auth } from "../../../../auth";
import { prisma } from "../../../..//lib/prisma";

type PayoutHistoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PayoutHistoryPage({
  params,
}: PayoutHistoryPageProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { id } = await params;

  const circle =
    await prisma.savingsCircle.findFirst({
      where: {
        id,

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

      include: {
        cycles: {
          include: {
            payoutRecipient: {
              include: {
                user: true,
              },
            },
          },

          orderBy: {
            cycleNumber: "asc",
          },
        },
      },
    });

  if (!circle) {
    notFound();
  }

  const completedPayouts =
    circle.cycles.filter(
      (cycle) =>
        cycle.payoutStatus ===
        "COMPLETED",
    );

  const totalPaidOut =
    completedPayouts.reduce(
      (total, cycle) =>
        total +
        Number(
          cycle.expectedAmount,
        ),
      0,
    );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/circles/${circle.id}`}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          ← Back to circle
        </Link>

        <div className="mt-6">
          <p className="font-semibold text-emerald-600">
            Financial history
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Payout history
          </h1>

          <p className="mt-3 text-slate-600">
            {circle.name}
          </p>

          <a
            href={`/api/circles/${circle.id}/payouts`}
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-emerald-700"
          >
            Download payout CSV
          </a>
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          <SummaryCard
            label="Completed payouts"
            value={
              completedPayouts.length.toString()
            }
          />

          <SummaryCard
            label="Total paid out"
            value={formatCurrency(
              totalPaidOut,
            )}
          />
        </section>

        {completedPayouts.length ===
        0 ? (
          <section className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              No completed payouts
            </h2>

            <p className="mt-3 text-slate-600">
              Completed payout records will appear here.
            </p>
          </section>
        ) : (
          <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {completedPayouts.map(
              (cycle) => (
                <article
                  key={cycle.id}
                  className="border-b border-slate-200 p-6 last:border-b-0"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-600">
                        Cycle{" "}
                        {
                          cycle.cycleNumber
                        }
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-slate-900">
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
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        {cycle.payoutCompletedAt
                          ? formatDate(
                              cycle.payoutCompletedAt,
                            )
                          : "Completion date unavailable"}
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(
                        Number(
                          cycle.expectedAmount,
                        ),
                      )}
                    </p>
                  </div>

                  {cycle.payoutReference && (
                    <p className="mt-5 text-sm text-slate-600">
                      Reference:{" "}
                      <span className="font-semibold text-slate-900">
                        {
                          cycle.payoutReference
                        }
                      </span>
                    </p>
                  )}

                  <Link
                    href={`/circles/${circle.id}/cycles/${cycle.id}`}
                    className="mt-5 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    View payout details →
                  </Link>
                  
                </article>
              ),
            )}
          </section>
        )}
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
      month: "long",
      year: "numeric",
    },
  ).format(date);
}