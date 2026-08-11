import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { auth } from "../../../../auth";
import CircleSettingsForm from "../../../../components/circle-settings-form";
import { prisma } from "../../../../lib/prisma";

import {
  regenerateInviteCode,
} from "./actions";

type SettingsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SettingsPage({
  params,
}: SettingsPageProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { id } = await params;

  const circle =
    await prisma.savingsCircle.findUnique({
      where: {
        id,
      },

      include: {
        owner: true,
      },
    });

  if (!circle) {
    notFound();
  }

  if (
    circle.owner.email !==
    session.user.email
  ) {
    notFound();
  }

  const regenerateAction =
    regenerateInviteCode.bind(
      null,
      circle.id,
    );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/circles/${circle.id}`}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          ← Back to circle
        </Link>

        <div className="mt-6">
          <p className="font-semibold text-emerald-600">
            Circle administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Circle settings
          </h1>
        </div>

        {circle.status !==
        "DRAFT" ? (
          <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-bold text-slate-900">
              Settings are locked
            </h2>

            <p className="mt-2 text-slate-700">
              Core savings settings cannot be changed after the circle has started.
            </p>
          </section>
        ) : (
          <>
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <CircleSettingsForm
                circleId={
                  circle.id
                }
                name={
                  circle.name
                }
                description={
                  circle.description ??
                  ""
                }
                contributionAmount={Number(
                  circle.contributionAmount,
                ).toFixed(2)}
                frequency={
                  circle.frequency
                }
                startDate={formatDateInput(
                  circle.startDate,
                )}
                maxMembers={
                  circle.maxMembers
                }
              />
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-emerald-600">
                Invite code
              </p>

              <p className="mt-2 text-2xl font-bold tracking-widest text-slate-900">
                {circle.inviteCode}
              </p>

              <p className="mt-3 text-sm text-slate-600">
                Regenerating this code immediately invalidates the previous code.
              </p>

              <form
                action={
                  regenerateAction
                }
                className="mt-5"
              >
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Generate new invite code
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function formatDateInput(
  date: Date,
) {
  return [
    date.getUTCFullYear(),
    String(
      date.getUTCMonth() +
        1,
    ).padStart(2, "0"),
    String(
      date.getUTCDate(),
    ).padStart(2, "0"),
  ].join("-");
}