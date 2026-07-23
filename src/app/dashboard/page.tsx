import { redirect } from "next/navigation";
import { auth } from "../../auth";
import LogoutButton from "../../components/logout-button";


import Link from "next/link";

const summaryCards = [
  {
    label: "Active circles",
    value: "2",
    description: "Savings groups you belong to",
  },
  {
    label: "Contribution due",
    value: "£100",
    description: "Due on 31 July 2026",
  },
  {
    label: "Total contributed",
    value: "£1,200",
    description: "Across all active circles",
  },
  {
    label: "Next payout",
    value: "£1,000",
    description: "Scheduled for October 2026",
  },
];

const activities = [
  {
    title: "Contribution recorded",
    details: "£100 recorded for Family Growth Circle",
    date: "12 July 2026",
  },
  {
    title: "New member joined",
    details: "Chinedu joined Family Growth Circle",
    date: "10 July 2026",
  },
  {
    title: "Payout completed",
    details: "June payout marked as completed",
    date: "30 June 2026",
  },
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userName =
  session.user.name ?? "SaveCircle member";

const initials = userName
  .split(" ")
  .map((name) => name.charAt(0))
  .join("")
  .slice(0, 2)
  .toUpperCase();

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

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
              {initials}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl md:grid-cols-[220px_1fr]">
        <aside className="border-b border-slate-200 bg-white p-6 md:min-h-[calc(100vh-73px)] md:border-r md:border-b-0">
          <nav
            aria-label="Dashboard navigation"
            className="flex gap-2 overflow-x-auto md:flex-col"
          >
            <DashboardLink href="/dashboard" label="Overview" active />
            <DashboardLink href="/circles" label="My circles" />
            <DashboardLink href="/dashboard" label="Contributions" />
            <DashboardLink href="/dashboard" label="Payouts" />
            <DashboardLink href="/dashboard" label="Notifications" />
            <LogoutButton />
          </nav>
        </aside>

        <main className="min-w-0 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-emerald-600">Dashboard</p>

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
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Join a circle
            </Link>

            <Link
              href="/circles/create"
              className="rounded-lg bg-emerald-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-emerald-700"
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
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Family Growth Circle
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    July 2026 contribution cycle
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>

              <div className="mt-7">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Contribution progress
                  </span>

                  <span className="font-semibold text-slate-900">
                    £800 of £1,000
                  </span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-4/5 rounded-full bg-emerald-600" />
                </div>
              </div>

              <dl className="mt-8 grid gap-5 sm:grid-cols-3">
                <CircleDetail label="Members paid" value="8 of 10" />
                <CircleDetail label="Deadline" value="31 July" />
                <CircleDetail label="Recipient" value="Ada Nwosu" />
              </dl>

              <button
                type="button"
                className="mt-8 rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View circle
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Recent activity
              </h2>

              <div className="mt-6 space-y-6">
                {activities.map((activity) => (
                  <article
                    key={`${activity.title}-${activity.date}`}
                    className="border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                  >
                    <h3 className="font-semibold text-slate-900">
                      {activity.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {activity.details}
                    </p>

                    <time className="mt-2 block text-xs text-slate-400">
                      {activity.date}
                    </time>
                  </article>
                ))}
              </div>
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

type CircleDetailProps = {
  label: string;
  value: string;
};

function CircleDetail({ label, value }: CircleDetailProps) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
    </div>
  );
}