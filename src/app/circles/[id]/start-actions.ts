"use server";

import { revalidatePath } from "next/cache";

import { auth } from "../../../auth";
import { getCycleDate } from "../../../lib/cycle-dates";
import { prisma } from "../../../lib/prisma";
import { createActivityLog } from "../../..//lib/activity-log";

export type StartCircleState = {
  error?: string;
  success?: string;
};

export async function startCircle(
  circleId: string,
  previousState: StartCircleState,
  formData: FormData,
): Promise<StartCircleState> {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      error:
        "You must be logged in to start a circle.",
    };
  }
  const userEmail = session.user.email;

  const confirmation =
    formData.get("confirmation");

  if (confirmation !== "confirmed") {
    return {
      error:
        "Confirm that you are ready to start the circle.",
    };
  }

  try {
    await prisma.$transaction(
      async (transaction) => 
      {
        const circle =
          await transaction.savingsCircle.findUnique({
            where: {
              id: circleId,
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
                  payoutPosition: "asc",
                },
              },

              _count: {
                select: {
                  cycles: true,
                },
              },
            },
          });

        if (!circle) {
          throw new StartCircleError(
            "Savings circle not found.",
          );
        }

        if (
          circle.owner.email !==
          userEmail
        ) {
          throw new StartCircleError(
            "Only the circle owner can start the circle.",
          );
        }

        if (
          circle.status !== "DRAFT"
        ) {
          throw new StartCircleError(
            "This savings circle has already been started.",
          );
        }

        if (circle._count.cycles > 0) {
          throw new StartCircleError(
            "Contribution cycles have already been generated.",
          );
        }

        if (
          circle.members.length !==
          circle.maxMembers
        ) {
          throw new StartCircleError(
            `The circle requires ${circle.maxMembers} active members before it can start. It currently has ${circle.members.length}.`,
          );
        }

        const positions =
          circle.members.map(
            (member) =>
              member.payoutPosition,
          );

        if (
          positions.some(
            (position) =>
              position === null,
          )
        ) {
          throw new StartCircleError(
            "Every active member must have a payout position.",
          );
        }

        const numericPositions =
          positions as number[];

        const uniquePositions =
          new Set(numericPositions);

        if (
          uniquePositions.size !==
          circle.members.length
        ) {
          throw new StartCircleError(
            "Every active member must have a unique payout position.",
          );
        }

        const expectedPositions =
          Array.from(
            {
              length:
                circle.members.length,
            },
            (_, index) => index + 1,
          );

        const sortedPositions =
          [...numericPositions].sort(
            (first, second) =>
              first - second,
          );

        const positionsAreComplete =
          expectedPositions.every(
            (position, index) =>
              position ===
              sortedPositions[index],
          );

        if (!positionsAreComplete) {
          throw new StartCircleError(
            "Payout positions must run consecutively from 1 to the number of members.",
          );
        }

        const expectedPayout =
          Number(
            circle.contributionAmount,
          ) * circle.members.length;

        for (
          let index = 0;
          index <
          circle.members.length;
          index++
        ) {
          const recipient =
            circle.members[index];

          const scheduledDate =
            getCycleDate(
              circle.startDate,
              circle.frequency,
              index,
            );

          await transaction.contributionCycle.create({
            data: {
              savingsCircleId:
                circle.id,

              cycleNumber:
                index + 1,

              scheduledDate,

              expectedAmount:
                expectedPayout,

              payoutRecipientId:
                recipient.id,

              status:
                index === 0
                  ? "OPEN"
                  : "UPCOMING",

              contributions: {
                create:
                  circle.members.map(
                    (member) => ({
                      memberId:
                        member.id,

                      amountDue:
                        circle.contributionAmount,

                      amountPaid: 0,

                      status:
                        "PENDING",
                    }),
                  ),
              },
            },
          });
        }

        await transaction.savingsCircle.update({
          where: {
            id: circle.id,
          },

          data: {
            status: "ACTIVE",
          },
        });
      await createActivityLog({
            transaction,
            circleId: circle.id,
            actorUserId:
              circle.owner.id,
            type: "CIRCLE_STARTED",
            title:
              "Savings circle started",
            description:
              `${circle.owner.firstName} ${circle.owner.lastName} activated the savings circle.`,
            metadata: {
              memberCount:
                circle.members.length,
              cycleCount:
                circle.members.length,
            },
          });
      await transaction.notification.createMany({
        data: circle.members.map((member) => ({
        userId: member.userId,
        type: "CIRCLE_STARTED",
        title: "Savings circle started",
        message: `${circle.name} is now active. Your first contribution cycle has opened.`,
        link: `/circles/${circle.id}/cycles`,
        priority: "HIGH",
           })),
        });
      },
    );
  } catch (error) {
    if (
      error instanceof
      StartCircleError
    ) {
      return {
        error: error.message,
      };
    }

    console.error(
      "Failed to start savings circle:",
      error,
    );

    return {
      error:
        "The circle could not be started. Please try again.",
    };
  }

  revalidatePath(
    `/circles/${circleId}`,
  );

  revalidatePath(
    `/circles/${circleId}/payout-order`,
  );

  revalidatePath(
    `/circles/${circleId}/cycles`,
  );

  revalidatePath("/circles");
  revalidatePath("/dashboard");

  return {
    success:
      "The savings circle has started successfully.",
  };
}

class StartCircleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StartCircleError";
  }
}