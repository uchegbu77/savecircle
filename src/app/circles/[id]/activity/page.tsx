import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

type ActivityPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ActivityPage({
  params,
}: ActivityPageProps) {
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
        activityLogs: {
          include: {
            actor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!circle) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/circles/${circle.id}`}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          ← Back to circle
        </Link>

        <div className="mt-6">
          <p className="font-semibold text-emerald-600">
            Audit history
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Circle activity
          </h1>

          <p className="mt-3 text-slate-600">
            Important events for{" "}
            <span className="font-semibold text-slate-900">
              {circle.name}
            </span>
            .
          </p>
        </div>

        {circle.activityLogs.length === 0 ? (
          <section className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              No activity recorded yet
            </h2>

            <p className="mt-3 text-slate-600">
              Important circle events will appear here.
            </p>
          </section>
        ) : (
          <section className="mt-10">
            <div className="relative border-l-2 border-slate-200 pl-7">
              {circle.activityLogs.map(
                (activity) => (
                  <article
                    key={activity.id}
                    className="relative pb-8 last:pb-0"
                  >
                    <span className="absolute -left-9.25 top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-slate-50 bg-emerald-600" />

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                            {formatActivityType(
                              activity.type,
                            )}
                          </p>

                          <h2 className="mt-2 text-lg font-bold text-slate-900">
                            {activity.title}
                          </h2>
                        </div>

                        <time className="text-xs text-slate-400">
                          {formatDate(
                            activity.createdAt,
                          )}
                        </time>
                      </div>

                      <p className="mt-3 leading-7 text-slate-600">
                        {activity.description}
                      </p>

                      {activity.actor && (
                        <p className="mt-3 text-sm text-slate-500">
                          Performed by{" "}
                          <span className="font-semibold text-slate-700">
                            {
                              activity.actor
                                .firstName
                            }{" "}
                            {
                              activity.actor
                                .lastName
                            }
                          </span>
                        </p>
                      )}
                    </div>
                  </article>
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function formatActivityType(
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}