"use server";

import { revalidatePath } from "next/cache";

import { auth } from "../../../../../auth";
import { prisma } from "../../../../../lib/prisma";
import type { Prisma } from "../../../../../generated/prisma/client";

export type ContributionActionState = {
  error?: string;
  success?: string;
};

export async function markContributionPaid(
  circleId: string,
  cycleId: string,
  contributionId: string,
  previousState: ContributionActionState,
  formData: FormData,
): Promise<ContributionActionState> {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      error: "You must be logged in.",
    };
  }

  const user = session.user;

  const reference =
    formData.get("reference")?.toString().trim() ?? "";

  const notes =
    formData.get("notes")?.toString().trim() ?? "";

  try {
    await prisma.$transaction(async (transaction) => {
      const contribution =
        await transaction.contribution.findFirst({
          where: {
            id: contributionId,
            cycleId,

            cycle: {
              savingsCircleId: circleId,
            },
          },

          include: {
            cycle: {
              include: {
                savingsCircle: {
                  include: {
                    owner: true,
                  },
                },
              },
            },
          },
        });

      if (!contribution) {
        throw new ContributionError(
          "Contribution record not found.",
        );
      }

      const circle = contribution.cycle.savingsCircle;

      if (!user || circle.owner.email !== user.email) {
        throw new ContributionError(
          "Only the circle owner can record payments.",
        );
      }

      if (circle.status !== "ACTIVE") {
        throw new ContributionError(
          "Payments can only be recorded for an active circle.",
        );
      }

      if (
        contribution.cycle.status ===
          "COMPLETED" ||
        contribution.cycle.status ===
          "CANCELLED"
      ) {
        throw new ContributionError(
          "This contribution cycle is closed.",
        );
      }

      if (
        contribution.status === "PAID"
      ) {
        throw new ContributionError(
          "This contribution has already been recorded as paid.",
        );
      }

      await transaction.contribution.update({
        where: {
          id: contribution.id,
        },

        data: {
          amountPaid:
            contribution.amountDue,

          status: "PAID",

          paidAt: new Date(),

          reference:
            reference || null,

          notes:
            notes || null,
        },
      });

      const remainingContributions =
        await transaction.contribution.count({
          where: {
            cycleId,
            status: {
              not: "PAID",
            },
          },
        });

      if (remainingContributions === 0) {
        await transaction.contributionCycle.update({
          where: {
            id: cycleId,
          },

          data: {
            status: "COMPLETED",
            payoutStatus: "READY",
          },
        });

        await openNextCycle(
          transaction,
          circleId,
          contribution.cycle.cycleNumber,
        );
      }
    });
  } catch (error) {
    if (
      error instanceof ContributionError
    ) {
      return {
        error: error.message,
      };
    }

    console.error(
      "Failed to record contribution:",
      error,
    );

    return {
      error:
        "The payment could not be recorded.",
    };
  }

  revalidateContributionPaths(
    circleId,
    cycleId,
  );

  return {
    success:
      "Contribution recorded successfully.",
  };
}

export async function resetContributionPayment(
  circleId: string,
  cycleId: string,
  contributionId: string,
): Promise<void> {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const user = session.user;

  await prisma.$transaction(
    async (transaction) => {
      const contribution =
        await transaction.contribution.findFirst({
          where: {
            id: contributionId,
            cycleId,

            cycle: {
              savingsCircleId: circleId,
            },
          },

          include: {
            cycle: {
              include: {
                savingsCircle: {
                  include: {
                    owner: true,
                  },
                },
              },
            },
          },
        });

      if (!contribution) {
        throw new Error(
          "Contribution record not found.",
        );
      }

      if (
        contribution.cycle.savingsCircle.owner.email !==
        user.email
      ) {
        throw new Error(
          "Only the circle owner can reset payments.",
        );
      }

      if (
        contribution.cycle
          .payoutStatus === "COMPLETED"
      ) {
        throw new Error(
          "A payment cannot be reset after the payout has been completed.",
        );
      }

      await transaction.contribution.update({
        where: {
          id: contribution.id,
        },

        data: {
          amountPaid: 0,
          status: "PENDING",
          paidAt: null,
          reference: null,
          notes: null,
        },
      });

      await transaction.contributionCycle.update({
        where: {
          id: cycleId,
        },

        data: {
          status: "OPEN",
          payoutStatus: "PENDING",
        },
      });
    },
  );

  revalidateContributionPaths(
    circleId,
    cycleId,
  );
}

async function openNextCycle(
  transaction: Prisma.TransactionClient,
  circleId: string,
  completedCycleNumber: number,
) 
{
  const nextCycle =
    await transaction.contributionCycle.findUnique({
      where: {
        savingsCircleId_cycleNumber: {
          savingsCircleId:
            circleId,

          cycleNumber:
            completedCycleNumber + 1,
        },
      },
    });

  if (
    nextCycle &&
    nextCycle.status === "UPCOMING"
  ) {
    await transaction.contributionCycle.update({
      where: {
        id: nextCycle.id,
      },

      data: {
        status: "OPEN",
      },
    });
  }
}

function revalidateContributionPaths(
  circleId: string,
  cycleId: string,
) {
  revalidatePath(
    `/circles/${circleId}`,
  );

  revalidatePath(
    `/circles/${circleId}/cycles`,
  );

  revalidatePath(
    `/circles/${circleId}/cycles/${cycleId}`,
  );

  revalidatePath("/contributions");
  revalidatePath("/dashboard");
}

class ContributionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContributionError";
  }
}