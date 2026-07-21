import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";

export default async function CirclesPage() {
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
            savingsCircle: {
              include: {
                _count: {
                  select: {
                    members: true,
                  },
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

  const memberships =
    user.circleMemberships;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              ← Dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              My savings circles
            </h1>

            <p className="mt-2 text-slate-600">
              View and manage all the savings groups you belong to.
            </p>
          </div>

          <Link
            href="/circles/create"
            className="rounded-lg bg-emerald-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-emerald-700"
          >
            Create new circle
          </Link>
        </div>

        {memberships.length === 0 ? (
          <section className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              You do not have any circles yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-600">
              Create your first savings circle and invite trusted members to join.
            </p>

            <Link
              href="/circles/create"
              className="mt-7 inline-block rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Create your first circle
            </Link>
          </section>
        ) : (
          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {memberships.map(
              (membership) => {
                const circle =
                  membership.savingsCircle;

                return (
                  <Link
                    key={membership.id}
                    href={`/circles/${circle.id}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {membership.role}
                        </span>

                        <h2 className="mt-4 text-xl font-bold text-slate-900 transition group-hover:text-emerald-600">
                          {circle.name}
                        </h2>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {circle.status}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
                      {circle.description ??
                        "No description provided."}
                    </p>

                    <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                      <div>
                        <dt className="text-xs text-slate-500">
                          Contribution
                        </dt>

                        <dd className="mt-1 font-semibold text-slate-900">
                          £
                          {Number(
                            circle.contributionAmount,
                          ).toFixed(2)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-slate-500">
                          Members
                        </dt>

                        <dd className="mt-1 font-semibold text-slate-900">
                          {
                            circle._count
                              .members
                          }
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-slate-500">
                          Frequency
                        </dt>

                        <dd className="mt-1 font-semibold capitalize text-slate-900">
                          {circle.frequency.toLowerCase()}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-slate-500">
                          Start date
                        </dt>

                        <dd className="mt-1 font-semibold text-slate-900">
                          {circle.startDate.toLocaleDateString(
                            "en-GB",
                          )}
                        </dd>
                      </div>
                    </dl>
                  </Link>
                );
              },
            )}
          </section>
        )}
      </div>
    </main>
  );
}