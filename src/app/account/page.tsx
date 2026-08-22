import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "../../auth";
import ChangePasswordForm from "../../components/change-password-form";
import ProfileForm from "../../components/profile-form";
import { prisma } from "../../lib/prisma";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          session.user.email,
      },

      select: {
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });

  if (!user) {
    redirect("/login");
  }

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      .toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          ← Dashboard
        </Link>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
              {initials}
            </div>

            <div>
              <p className="font-semibold text-emerald-600">
                Account
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {user.firstName}{" "}
                {user.lastName}
              </h1>

              <p className="mt-2 text-slate-600">
                {user.email}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Member since{" "}
                {formatDate(
                  user.createdAt,
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="border-b border-slate-100 pb-5">
            <p className="font-semibold text-emerald-600">
              Personal details
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Profile
            </h2>

            <p className="mt-2 text-slate-600">
              Update the name displayed throughout SaveCircle.
            </p>
          </div>

          <div className="mt-6">
            <ProfileForm
              firstName={
                user.firstName
              }
              lastName={
                user.lastName
              }
              email={user.email}
            />
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="border-b border-slate-100 pb-5">
            <p className="font-semibold text-emerald-600">
              Security
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Change password
            </h2>

            <p className="mt-2 text-slate-600">
              You must enter your current password before choosing a new one.
            </p>
          </div>

          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </section>
      </div>
    </main>
  );
}

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}