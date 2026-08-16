"use server";

import { revalidatePath } from "next/cache";

import { auth } from "../../../../../auth";
import { prisma } from "../../../../../lib/prisma";
import { createActivityLog } from "../../../../../lib/activity-log";

export type CompletePayoutState = {
  error?: string;
  success?: string;
};

export async function completePayout(
  circleId: string,
  cycleId: string,
  previousState: CompletePayoutState,
  formData: FormData,
): Promise<CompletePayoutState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return {
      error: "You must be logged in.",
    };
  }

  const payoutReference =
    formData.get("payoutReference")?.toString().trim() ?? "";

  const payoutNotes =
    formData.get("payoutNotes")?.toString().trim() ?? "";

  const confirmation =
    formData.get("confirmation")?.toString();

  if (confirmation !== "confirmed") {
    return {
      error: "Confirm that the payout has been sent.",
    };
  }

  if (payoutReference.length > 100) {
    return {
      error: "The payout reference cannot exceed 100 characters.",
    };
  }

  if (payoutNotes.length > 500) {
    return {
      error: "The payout notes cannot exceed 500 characters.",
    };
  }

  try {
    await prisma.$transaction(async (transaction) => {
      const cycle =
        await transaction.contributionCycle.findFirst({
          where: {
            id: cycleId,
            savingsCircleId: circleId,
          },

          include: {
            savingsCircle: {
              include: {
                owner: true,

                cycles: {
                  select: {
                    id: true,
                    cycleNumber: true,
                    payoutStatus: true,
                  },

                  orderBy: {
                    cycleNumber: "asc",
                  },
                },
              },
            },

            contributions: {
              select: {
                id: true,
                status: true,
                amountDue: true,
                amountPaid: true,
              },
            },

            payoutRecipient: {
              include: {
                user: true,
              },
            },
          },
        });

      if (!cycle) {
        throw new PayoutError(
          "The contribution cycle could not be found.",
        );
      }

      const circle = cycle.savingsCircle;

      if (circle.owner.email !== userEmail) {
        throw new PayoutError(
          "Only the circle owner can confirm a payout.",
        );
      }

      if (circle.status !== "ACTIVE") {
        throw new PayoutError(
          "Payouts can only be completed for an active circle.",
        );
      }

      if (cycle.status !== "COMPLETED") {
        throw new PayoutError(
          "All member contributions must be collected before completing the payout.",
        );
      }

      if (cycle.payoutStatus === "COMPLETED") {
        throw new PayoutError(
          "This payout has already been completed.",
        );
      }

      if (cycle.payoutStatus !== "READY") {
        throw new PayoutError(
          "This payout is not ready for completion.",
        );
      }

      const unpaidContribution =
        cycle.contributions.find(
          (contribution) =>
            contribution.status !== "PAID" ||
            Number(contribution.amountPaid) !==
              Number(contribution.amountDue),
        );

      if (unpaidContribution) {
        throw new PayoutError(
          "Every contribution must be fully paid before completing the payout.",
        );
      }

      const owner =
        await transaction.user.findUnique({
          where: {
            email: userEmail,
          },

          select: {
            id: true,
          },
        });

      if (!owner) {
        throw new PayoutError(
          "The circle owner account could not be found.",
        );
      }

      await transaction.contributionCycle.update({
        where: {
          id: cycle.id,
        },

        data: {
          payoutStatus: "COMPLETED",
          payoutCompletedAt: new Date(),
          payoutCompletedBy: owner.id,

          payoutReference:
            payoutReference || null,

          payoutNotes:
            payoutNotes || null,
        },
      });

        await createActivityLog({
          transaction,
          circleId,
          actorUserId: owner.id,
          type:
            "PAYOUT_COMPLETED",
          title:
            "Payout completed",
          description:
            `Cycle ${cycle.cycleNumber} payout to ${cycle.payoutRecipient.user.firstName} ${cycle.payoutRecipient.user.lastName} was confirmed as completed.`,
          metadata: {
            cycleNumber:
              cycle.cycleNumber,
            amount:
              Number(
                cycle.expectedAmount,
              ),
          },
        });


      await transaction.notification.create({
          data: {
            userId: cycle.payoutRecipient.userId,
            type: "PAYOUT_COMPLETED",
            title: "Your payout was completed",
            message: `The payout of £${Number(
              cycle.expectedAmount,
            ).toFixed(2)} for ${circle.name}, Cycle ${
              cycle.cycleNumber
            }, was confirmed as completed.`,
            link: `/circles/${circleId}/cycles/${cycleId}`,
            priority: "HIGH",
          },
        });

      const remainingPayouts =
        await transaction.contributionCycle.count({
          where: {
            savingsCircleId: circle.id,

            id: {
              not: cycle.id,
            },

            payoutStatus: {
              not: "COMPLETED",
            },
          },
        });

      if (remainingPayouts === 0) {
        await transaction.savingsCircle.update({
          where: {
            id: circle.id,
          },

          data: {
            status: "COMPLETED",
          },
        });
      }

      await createActivityLog({
          transaction,
          circleId,
          actorUserId: owner.id,
          type:
            "CIRCLE_COMPLETED",
          title:
            "Savings circle completed",
          description:
            `${circle.name} completed all scheduled contribution cycles and payouts.`,
        });

    });
  } catch (error) {
    if (error instanceof PayoutError) {
      return {
        error: error.message,
      };
    }

    console.error(
      "Failed to complete payout:",
      error,
    );

    return {
      error:
        "The payout could not be completed. Please try again.",
    };
  }

  revalidatePayoutPaths(circleId, cycleId);

  return {
    success: "Payout completed successfully.",
  };
}

function revalidatePayoutPaths(
  circleId: string,
  cycleId: string,
) {
  revalidatePath(`/circles/${circleId}`);

  revalidatePath(
    `/circles/${circleId}/cycles`,
  );

  revalidatePath(
    `/circles/${circleId}/cycles/${cycleId}`,
  );

  revalidatePath("/circles");
  revalidatePath("/contributions");
  revalidatePath("/dashboard");
}

class PayoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayoutError";
  }
}