import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "../../../auth";
import CreateCircleForm from "../../../components/create-circle";

export default async function CreateCirclePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/circles"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          ← Back to my circles
        </Link>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="font-semibold text-emerald-600">
            New savings circle
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Create your circle
          </h1>

          <p className="mt-3 text-slate-600">
            Set the basic rules for your savings group.
            You will automatically become the circle owner.
          </p>

          <CreateCircleForm />
        </section>
      </div>
    </main>
  );
}