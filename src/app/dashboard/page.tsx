import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "../../auth";
import LogoutButton from "../../components/logout-button";
import { prisma } from "../../lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },

    include: {
      circleMemberships: {
        where: {
          status: "ACTIVE",
        },

        include: {
          savingsCircle: {
            include: {
              _count: {
                select: {
                  members: {
                    where: {
                      status: "ACTIVE",
                    },
                  },
                },
              },

              cycles: {
                where: {
                  status: "OPEN",
                },

                include: {
                  payoutRecipient: {
                    include: {
                      user: true,
                    },
                  },

                  contributions: {
                    select: {
                      amountPaid: true,
                      status: true,
                    },
                  },
                },

                orderBy: {
                  cycleNumber: "asc",
                },

                take: 1,
              },
            },
          },
        },

        orderBy: {
          joinedAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const unreadNotificationCount =
  await prisma.notification.count({
    where: {
      userId: user.id,
      isRead: false,
    },
  });

  const activeMemberships =
    user.circleMemberships.filter(
      (membership) =>
        membership.savingsCircle.status === "ACTIVE",
    );

  const userContributions =
    await prisma.contribution.findMany({
      where: {
        member: {
          userId: user.id,
        },

        cycle: {
          savingsCircle: {
            status: {
              in: ["ACTIVE", "COMPLETED"],
            },
          },
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
        cycle: {
          scheduledDate: "asc",
        },
      },
    });

  const openContributions =
    userContributions.filter(
      (contribution) =>
        contribution.cycle.status === "OPEN" &&
        contribution.status !== "PAID",
    );

  const contributionDue =
    openContributions.reduce(
      (total, contribution) =>
        total +
        Math.max(
          0,
          Number(contribution.amountDue) -
            Number(contribution.amountPaid),
        ),
      0,
    );

  const totalContributed =
    userContributions.reduce(
      (total, contribution) =>
        total +
        Number(contribution.amountPaid),
      0,
    );

  const nextPayout =
    await prisma.contributionCycle.findFirst({
      where: {
        payoutRecipient: {
          userId: user.id,
          status: "ACTIVE",
        },

        savingsCircle: {
          status: "ACTIVE",
        },

        payoutStatus: {
          not: "COMPLETED",
        },
      },

      include: {
        savingsCircle: true,
      },

      orderBy: {
        scheduledDate: "asc",
      },
    });

  const recentPayments =
    await prisma.contribution.findMany({
      where: {
        member: {
          userId: user.id,
        },

        status: "PAID",
      },

      include: {
        cycle: {
          include: {
            savingsCircle: true,
          },
        },
      },

      orderBy: {
        paidAt: "desc",
      },

      take: 5,
    });

  const userName =
    `${user.firstName} ${user.lastName}`;

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      .toUpperCase();

  const summaryCards = [
    {
      label: "Active circles",
      value: activeMemberships.length.toString(),
      description:
        activeMemberships.length === 1
          ? "Savings circle currently active"
          : "Savings circles currently active",
    },
    {
      label: "Contribution due",
      value: formatCurrency(contributionDue),
      description:
        openContributions.length === 0
          ? "No open contributions due"
          : `${openContributions.length} open contribution ${
              openContributions.length === 1
                ? "payment"
                : "payments"
            }`,
    },
    {
      label: "Total contributed",
      value: formatCurrency(totalContributed),
      description:
        "Total payments recorded across your circles",
    },
    {
      label: "Next payout",
      value: nextPayout
        ? formatCurrency(
            Number(nextPayout.expectedAmount),
          )
        : "None",
      description: nextPayout
        ? `${nextPayout.savingsCircle.name} · ${formatDate(
            nextPayout.scheduledDate,
          )}`
        : "No upcoming payout scheduled",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-emerald-600"
          >
            SaveCircle
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:inline">
              Welcome, {userName}
            </span>

            <Link
              href="/account"
              aria-label="Open account settings"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700 transition hover:bg-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              {initials}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full min-w-0 max-w-7xl md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className=" min-w-0 border-b border-slate-200 bg-white p-6 md:min-h-[calc(100vh-73px)] md:border-r md:border-b-0">
          <nav
            aria-label="Dashboard navigation"
            className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible md:pb-0"
          >
            <DashboardLink
              href="/dashboard"
              label="Overview"
              active
            />

            <DashboardLink
              href="/circles"
              label="My circles"
            />

            <DashboardLink
              href="/contributions"
              label="Contributions"
            />

            <DashboardLink
              href="/reports"
              label="Reports"
            />

           <Link
              href="/notifications"
              className="flex shrink-0 items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <span>Notifications</span>

              {unreadNotificationCount > 0 && (
                <span className="flex min-w-6 items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              )}
            </Link>

              <DashboardLink
                href="/account"
                label="Account"
              />

            <LogoutButton />
          </nav>
        </aside>

        <main className="min-w-0 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-emerald-600">
                Dashboard
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Your savings overview
              </h1>

              <p className="mt-2 text-slate-600">
                Monitor your circles, contributions and upcoming payouts.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/circles/join"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                Join a circle
              </Link>

              <Link
                href="/circles/create"
                className="rounded-lg bg-emerald-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                Create new circle
              </Link>
            </div>
          </div>

          <section
            aria-label="Savings summary"
            className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
            {summaryCards.map((card) => (
              <article
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {card.value}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {card.description}
                </p>
              </article>
            ))}
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.5fr_1fr]">
            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-semibold text-emerald-600">
                    Current activity
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Active savings circles
                  </h2>
                </div>

                <Link
                  href="/circles"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  View all
                </Link>
              </div>

              {activeMemberships.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                  <h3 className="text-xl font-bold text-slate-900">
                    No active circles
                  </h3>

                  <p className="mx-auto mt-3 max-w-md text-slate-600">
                    Create a new savings circle or join an existing one.
                  </p>

                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                      href="/circles/join"
                      className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                    >
                      Join a circle
                    </Link>

                    <Link
                      href="/circles/create"
                      className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                    >
                      Create a circle
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {activeMemberships.map(
                    (membership) => {
                      const circle =
                        membership.savingsCircle;

                      const openCycle =
                        circle.cycles[0];

                      const collectedAmount =
                        openCycle?.contributions.reduce(
                          (total, contribution) =>
                            total +
                            Number(
                              contribution.amountPaid,
                            ),
                          0,
                        ) ?? 0;

                      const expectedAmount =
                        openCycle
                          ? Number(
                              openCycle.expectedAmount,
                            )
                          : 0;

                      const progress =
                        expectedAmount > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (collectedAmount /
                                  expectedAmount) *
                                  100,
                              ),
                            )
                          : 0;

                      return (
                        <article
                          key={membership.id}
                          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  {formatStatus(
                                    membership.role,
                                  )}
                                </span>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  {
                                    circle._count
                                      .members
                                  }{" "}
                                  members
                                </span>
                              </div>

                              <h3 className="mt-4 text-xl font-bold text-slate-900">
                                {circle.name}
                              </h3>

                              <p className="mt-2 text-sm text-slate-600">
                                {formatCurrency(
                                  Number(
                                    circle.contributionAmount,
                                  ),
                                )}{" "}
                                {circle.frequency.toLowerCase()}
                              </p>
                            </div>

                            <Link
                              href={`/circles/${circle.id}`}
                              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                            >
                              Open circle →
                            </Link>
                          </div>

                          {openCycle ? (
                            <div className="mt-6 rounded-xl bg-slate-50 p-5">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-sm text-slate-500">
                                    Open cycle{" "}
                                    {
                                      openCycle.cycleNumber
                                    }
                                  </p>

                                  <p className="mt-1 font-semibold text-slate-900">
                                    Recipient:{" "}
                                    {
                                      openCycle
                                        .payoutRecipient
                                        .user.firstName
                                    }{" "}
                                    {
                                      openCycle
                                        .payoutRecipient
                                        .user.lastName
                                    }
                                  </p>
                                </div>

                                <p className="font-bold text-emerald-600">
                                  {formatCurrency(
                                    collectedAmount,
                                  )}{" "}
                                  of{" "}
                                  {formatCurrency(
                                    expectedAmount,
                                  )}
                                </p>
                              </div>

                              <div className="mt-5">
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

                              <Link
                                href={`/circles/${circle.id}/cycles/${openCycle.id}`}
                                className="mt-5 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                              >
                                View open cycle →
                              </Link>
                            </div>
                          ) : (
                            <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
                              There is currently no open contribution cycle.
                            </p>
                          )}
                        </article>
                      );
                    },
                  )}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Recent payments
                </h2>

                <Link
                  href="/contributions"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  View all
                </Link>
              </div>

              {recentPayments.length === 0 ? (
                <div className="mt-8 rounded-xl bg-slate-50 p-6 text-center">
                  <p className="text-sm text-slate-600">
                    No payments have been recorded yet.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {recentPayments.map(
                    (payment) => (
                      <article
                        key={payment.id}
                        className="border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {
                                payment.cycle
                                  .savingsCircle
                                  .name
                              }
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              Cycle{" "}
                              {
                                payment.cycle
                                  .cycleNumber
                              }{" "}
                              contribution
                            </p>
                          </div>

                          <p className="font-bold text-emerald-600">
                            {formatCurrency(
                              Number(
                                payment.amountPaid,
                              ),
                            )}
                          </p>
                        </div>

                        <time className="mt-2 block text-xs text-slate-400">
                          {payment.paidAt
                            ? formatDate(
                                payment.paidAt,
                              )
                            : "Date unavailable"}
                        </time>
                      </article>
                    ),
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

type DashboardLinkProps = {
  href: string;
  label: string;
  active?: boolean;
};

function DashboardLink({
  href,
  label,
  active = false,
}: DashboardLinkProps) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-lg px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}