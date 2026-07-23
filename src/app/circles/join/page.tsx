import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "../../../auth";
import JoinCircleForm from "../../../components/join-circle-form";

export default async function JoinCirclePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-xl">
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

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-700">
            +
          </div>

          <p className="mt-6 font-semibold text-emerald-600">
            Join a circle
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Enter your invite code
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Ask the circle owner for the invitation code, then enter it below to join the group.
          </p>

          <JoinCircleForm />
        </section>
      </div>
    </main>
  );
}