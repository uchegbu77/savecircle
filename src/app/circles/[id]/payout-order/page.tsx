import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { auth } from "../../../../auth";
import PayoutOrderForm from "../../../../components/payout-order-form";
import { prisma } from "../../../../lib/prisma";

type PayoutOrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PayoutOrderPage({
  params,
}: PayoutOrderPageProps) {
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
            user: {
              email:
                session.user.email,
            },

            status: "ACTIVE",
          },
        },
      },

      include: {
        owner: true,

        members: {
          where: {
            status: "ACTIVE",
          },

          include: {
            user: true,
          },

          orderBy: {
            joinedAt: "asc",
          },
        },
      },
    });

  if (!circle) {
    notFound();
  }

  const canEdit =
    circle.owner.email ===
      session.user.email &&
    circle.status === "DRAFT";

  const expectedPayout =
    Number(
      circle.contributionAmount,
    ) * circle.members.length;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/circles/${circle.id}`}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          ← Back to circle
        </Link>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="font-semibold text-emerald-600">
            Circle setup
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Payout order
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Arrange the order in which members will receive the savings pool.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Active members"
              value={
                circle.members.length.toString()
              }
            />

            <SummaryCard
              label="Maximum members"
              value={
                circle.maxMembers.toString()
              }
            />

            <SummaryCard
              label="Current payout"
              value={`£${expectedPayout.toFixed(
                2,
              )}`}
            />
          </div>

          {!canEdit &&
            circle.status !==
              "DRAFT" && (
              <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                The payout order is locked because this circle has already started.
              </p>
            )}

          <PayoutOrderForm
            circleId={circle.id}
            members={
              circle.members
            }
            canEdit={canEdit}
          />
        </section>
      </div>
    </main>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
};

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}