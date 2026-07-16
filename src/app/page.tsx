import Link from "next/link";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";

const features = [
  {
    title: "Create savings circles",
    description:
      "Set up a trusted group, define the contribution amount and invite your members.",
  },
  {
    title: "Track contributions",
    description:
      "See paid, pending and overdue contributions clearly for every savings cycle.",
  },
  {
    title: "Organise payouts",
    description:
      "Create a transparent payout order so every member knows when they will receive the pool.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your circle",
    description:
      "Choose your group name, contribution amount and payment frequency.",
  },
  {
    number: "02",
    title: "Invite members",
    description:
      "Share an invitation code or link with trusted friends and colleagues.",
  },
  {
    number: "03",
    title: "Save together",
    description:
      "Track payments, upcoming deadlines and scheduled payouts in one place.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-slate-50">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                Group savings made transparent
              </span>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Save together.
                <span className="block text-emerald-600">
                  Grow together.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                SaveCircle helps trusted groups organise contributions, monitor
                payments and manage rotating payouts without relying on
                spreadsheets or scattered messages.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="rounded-lg bg-emerald-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-emerald-700"
                >
                  Create your account
                </Link>

                <a
                  href="#how-it-works"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  See how it works
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm text-slate-500">Current savings circle</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Family Growth Circle
                  </h2>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <DashboardPreviewCard
                  label="Monthly contribution"
                  value="£100"
                />
                <DashboardPreviewCard label="Members" value="10" />
                <DashboardPreviewCard label="Collected" value="£800" />
                <DashboardPreviewCard label="Outstanding" value="£200" />
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Current payout recipient
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      Ada Nwosu
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-500">Payout amount</p>
                    <p className="mt-1 font-bold text-emerald-600">£1,000</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">Contribution progress</span>
                    <span className="font-semibold text-slate-900">80%</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-4/5 rounded-full bg-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-semibold text-emerald-600">Core features</p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything your savings group needs
            </h2>

            <p className="mt-4 text-slate-600">
              Keep your circle organised, accountable and informed throughout
              every savings cycle.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 p-7 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
                  ✓
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-slate-950">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="max-w-2xl">
              <p className="font-semibold text-emerald-400">How it works</p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Start saving in three simple steps
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <article key={step.number}>
                  <p className="text-4xl font-bold text-emerald-400">
                    {step.number}
                  </p>

                  <h3 className="mt-5 text-xl font-bold text-white">
                    {step.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-300">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl rounded-3xl bg-emerald-600 px-6 py-14 text-center sm:px-12">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to organise your savings circle?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-emerald-50">
              Create your account and begin setting up a transparent group
              savings plan.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

type DashboardPreviewCardProps = {
  label: string;
  value: string;
};

function DashboardPreviewCard({
  label,
  value,
}: DashboardPreviewCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}