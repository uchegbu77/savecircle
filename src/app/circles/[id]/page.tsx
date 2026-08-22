import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StartCircleForm from "../../../components/start-circle-form";
import ConfirmSubmitButton from "../../../components/confirm-submit-button";

import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import {
  demoteMember,
  promoteMember,
  removeMember,
} from "./member-actions";

type CirclePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CirclePage({
  params,
}: CirclePageProps) {
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
  const expectedPayout =
  Number(
    circle.contributionAmount,
  ) * circle.members.length;

const allPositionsAssigned =
  circle.members.length > 0 &&
  circle.members.every(
    (member) =>
      member.payoutPosition !==
      null,
  );
  const isOwner =
  circle.owner.email ===
  session.user.email;
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/circles"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          ← Back to my circles
        </Link>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {circle.status}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {circle.frequency}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                {circle.name}
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                {circle.description ??
                  "No description provided."}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-5 lg:min-w-64">
              <p className="text-sm text-emerald-700">
                Invite code
              </p>

              <p className="mt-2 text-2xl font-bold tracking-widest text-emerald-900">
                {circle.inviteCode}
              </p>

              <p className="mt-2 text-xs text-emerald-700">
                Members will use this code to join the circle.
              </p>
            </div>
          </div>

          <dl className="mt-8 grid gap-5 border-t border-slate-100 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <CircleStat
              label="Contribution"
              value={`£${Number(
                circle.contributionAmount,
              ).toFixed(2)}`}
            />

            <CircleStat
              label="Frequency"
              value={
                circle.frequency ===
                "WEEKLY"
                  ? "Weekly"
                  : "Monthly"
              }
            />

            <CircleStat
              label="Start date"
              value={circle.startDate.toLocaleDateString(
                "en-GB",
              )}
            />

            <CircleStat
              label="Members"
              value={circle.members.length.toString()}
            />

            <CircleStat
              label="Circle capacity"
              value={`${circle.members.length} / ${circle.maxMembers}`}
            />

            <CircleStat
                label="Expected payout"
                value={`£${expectedPayout.toFixed(
                  2,
                )}`}
            />
          </dl>
        </section>

       {isOwner &&
  circle.status === "DRAFT" && (
    <StartCircleForm
      circleId={circle.id}
      activeMemberCount={
        circle.members.length
      }
      maximumMemberCount={
        circle.maxMembers
      }
      allPositionsAssigned={
        allPositionsAssigned
      }
    />
  )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={`/circles/${circle.id}/payout-order`}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View payout order
            </Link>
            <Link
              href={`/circles/${circle.id}/settings`}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Circle settings
            </Link>
            <Link
              href={`/circles/${circle.id}/activity`}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Activity history
            </Link>

            <Link
              href={`/circles/${circle.id}/payouts`}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Payout history
            </Link>

            {circle.status === "ACTIVE" ? (
              <Link
                href={`/circles/${circle.id}/cycles`}
                className="rounded-lg bg-emerald-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-emerald-700"
              >
                Manage contributions
              </Link>
              )
             : (
              <Link
                href={`/circles/${circle.id}/cycles`}
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View contribution schedule
              </Link>
            )}
          </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="font-semibold text-emerald-600">
              Circle members
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Members
            </h2>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            {circle.members.map(
              (member) => (
                <article
                  key={member.id}
                  className="flex flex-col gap-3 border-b border-slate-200 p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {
                        member.user
                          .firstName
                      }{" "}
                      {
                        member.user
                          .lastName
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {member.user.email}
                    </p>
                      {isOwner &&
                          circle.status === "DRAFT" &&
                          member.role !== "OWNER" && (
                        <div className="flex flex-wrap gap-2">
                              {member.role ===
                              "MEMBER" ? (
                                <form
                                  action={promoteMember.bind(
                                    null,
                                    circle.id,
                                    member.id,
                                  )}
                                >
                                  <button
                                    type="submit"
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                                  >
                                    Make admin
                                  </button>
                                </form>
                              ) : (
                                <form
                                  action={demoteMember.bind(
                                    null,
                                    circle.id,
                                    member.id,
                                  )}
                                >
                                  <button
                                    type="submit"
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                                  >
                                    Remove admin
                                  </button>
                                </form>
                              )}

                              <form
                                action={removeMember.bind(
                                  null,
                                  circle.id,
                                  member.id,
                                )}
                              >
                               <ConfirmSubmitButton
                                  confirmationMessage={`Remove ${member.user.firstName} ${member.user.lastName} from this savings circle?`}
                                  pendingText="Removing..."
                                >
                                  Remove member
                                </ConfirmSubmitButton>
                              </form>
                            </div>
                          )}

                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {member.role}
                    </span>

                    <span className="text-sm text-slate-500">
                      Joined{" "}
                      {member.joinedAt.toLocaleDateString(
                        "en-GB",
                      )}
                    </span>
                  </div>

                  
                </article>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

type CircleStatProps = {
  label: string;
  value: string;
};

function CircleStat({
  label,
  value,
}: CircleStatProps) {
  return (
    <div>
      <dt className="text-sm text-slate-500">
        {label}
      </dt>

      <dd className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </dd>
    </div>
  );
}