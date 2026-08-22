import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { generateContributionReminders } from "../../lib/contribution-reminders";

import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "./actions";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }
 const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/login");
  }

  await generateContributionReminders(
  user.id,
);

const notifications =
  await prisma.notification.findMany({
    where: {
      userId: user.id,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

 



  const unreadCount =
    notifications.filter(
      (notification) => !notification.isRead,
    ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          ← Dashboard
        </Link>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold text-emerald-600">
              Updates and reminders
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Notifications
            </h1>

            <p className="mt-3 text-slate-600">
              You have {unreadCount} unread{" "}
              {unreadCount === 1
                ? "notification"
                : "notifications"}
              .
            </p>
          </div>

          {unreadCount > 0 && (
            <form action={markAllNotificationsRead}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Mark all as read
              </button>
            </form>
          )}
        </div>

        {notifications.length === 0 ? (
          <section className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
              🔔
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              No notifications yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-600">
              Contribution reminders, payout updates and circle activity will
              appear here.
            </p>
          </section>
        ) : (
          <section className="mt-10 space-y-4">
            {notifications.map(
              (notification) => {
                const readAction =
                  markNotificationRead.bind(
                    null,
                    notification.id,
                  );

                const deleteAction =
                  deleteNotification.bind(
                    null,
                    notification.id,
                  );

                return (
                  <article
                    key={notification.id}
                    className={`rounded-2xl border p-6 shadow-sm ${
                      notification.isRead
                        ? "border-slate-200 bg-white"
                        : "border-emerald-200 bg-emerald-50"
                    }`}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ${
                            notification.isRead
                              ? "bg-slate-100"
                              : "bg-emerald-100"
                          }`}
                        >
                          {getNotificationIcon(
                            notification.type,
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-bold text-slate-900">
                              {notification.title}
                            </h2>

                            {!notification.isRead && (
                              <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                                New
                              </span>
                            )}

                            {notification.priority ===
                              "HIGH" && (
                              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                                Important
                              </span>
                            )}
                          </div>

                          <p className="mt-2 leading-7 text-slate-600">
                            {notification.message}
                          </p>

                          <time className="mt-3 block text-xs text-slate-400">
                            {formatNotificationDate(
                              notification.createdAt,
                            )}
                          </time>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {!notification.isRead && (
                          <form action={readAction}>
                            <button
                              type="submit"
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                            >
                              Mark read
                            </button>
                          </form>
                        )}

                        <form action={deleteAction}>
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>

                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="mt-5 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                      >
                        View details →
                      </Link>
                    )}
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

function getNotificationIcon(
  type: string,
) {
  switch (type) {
    case "MEMBER_JOINED":
      return "👤";

    case "CIRCLE_STARTED":
      return "🚀";

    case "CONTRIBUTION_DUE":
      return "💷";

    case "CONTRIBUTION_PAID":
      return "✓";

    case "PAYOUT_READY":
      return "🔔";

    case "PAYOUT_COMPLETED":
      return "🎉";

    default:
      return "ℹ️";
  }
}

function formatNotificationDate(
  date: Date,
) {
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