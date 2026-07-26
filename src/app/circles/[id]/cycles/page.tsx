import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

type CyclesPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CyclesPage({
  params,
}: CyclesPageProps) {
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

            contributions: {
              select: {
                amountDue: true,
                amountPaid: true,
                status: true,
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

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/circles/${circle.id}`}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          ← Back to circle
        </Link>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold text-emerald-600">
              Savings schedule
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Contribution cycles
            </h1>

            <p className="mt-3 text-slate-600">
              {circle.name}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
              circle.status ===
              "ACTIVE"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {circle.status}
          </span>
        </div>

        {circle.cycles.length === 0 ? (
          <section className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              No contribution cycles yet
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-slate-600">
              The circle owner must complete the member list, arrange the payout order and start the circle.
            </p>
          </section>
        ) : (
          <section className="mt-10 space-y-5">
            {circle.cycles.map(
              (cycle) => {
                const totalPaid =
                  cycle.contributions.reduce(
                    (
                      total,
                      contribution,
                    ) =>
                      total +
                      Number(
                        contribution.amountPaid,
                      ),
                    0,
                  );

                const paidMembers =
                  cycle.contributions.filter(
                    (contribution) =>
                      contribution.status ===
                      "PAID",
                  ).length;

                const progress =
                  Number(
                    cycle.expectedAmount,
                  ) > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (totalPaid /
                            Number(
                              cycle.expectedAmount,
                            )) *
                            100,
                        ),
                      )
                    : 0;

                return (
                  <article
                    key={cycle.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                          {cycle.cycleNumber}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Scheduled payout
                          </p>

                          <h2 className="mt-1 text-xl font-bold text-slate-900">
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
                          </h2>

                          <p className="mt-2 text-sm text-slate-600">
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
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <StatusBadge
                          status={
                            cycle.status
                          }
                        />

                        <PayoutBadge
                          status={
                            cycle.payoutStatus
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-7 grid gap-4 sm:grid-cols-3">
                      <CycleStat
                        label="Expected pool"
                        value={`£${Number(
                          cycle.expectedAmount,
                        ).toFixed(2)}`}
                      />

                      <CycleStat
                        label="Collected"
                        value={`£${totalPaid.toFixed(
                          2,
                        )}`}
                      />

                      <CycleStat
                        label="Members paid"
                        value={`${paidMembers} of ${cycle.contributions.length}`}
                      />
                    </div>

                    <div className="mt-6">
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
                          className="h-full rounded-full bg-emerald-600 transition-all"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>
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

type CycleStatProps = {
  label: string;
  value: string;
};

function CycleStat({
  label,
  value,
}: CycleStatProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      Cycle: {formatStatus(status)}
    </span>
  );
}

function PayoutBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
      Payout: {formatStatus(status)}
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