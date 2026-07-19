import { prisma } from "../../lib/prisma";

export default async function DatabaseTestPage() {
  const userCount = await prisma.user.count();
  const circleCount = await prisma.savingsCircle.count();

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900">
          SaveCircle Database Test
        </h1>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Registered users
            </p>

            <p className="mt-3 text-4xl font-bold text-emerald-600">
              {userCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Savings circles
            </p>

            <p className="mt-3 text-4xl font-bold text-emerald-600">
              {circleCount}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}