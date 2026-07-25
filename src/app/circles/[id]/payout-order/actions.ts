"use server";

import { revalidatePath } from "next/cache";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export type PayoutOrderState = {
  error?: string;
  success?: string;
};

export async function updatePayoutOrder(
  circleId: string,
  previousState: PayoutOrderState,
  formData: FormData,
): Promise<PayoutOrderState> {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      error:
        "You must be logged in.",
    };
  }

  const circle =
    await prisma.savingsCircle.findUnique({
      where: {
        id: circleId,
      },

      include: {
        owner: true,

        members: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    });

  if (!circle) {
    return {
      error:
        "Savings circle not found.",
    };
  }

  if (
    circle.owner.email !==
    session.user.email
  ) {
    return {
      error:
        "Only the circle owner can change the payout order.",
    };
  }

  if (
    circle.status !== "DRAFT"
  ) {
    return {
      error:
        "The payout order cannot be changed after the circle has started.",
    };
  }

  const assignments =
    circle.members.map((member) => {
      const rawPosition =
        formData
          .get(
            `position-${member.id}`,
          )
          ?.toString();

      return {
        memberId: member.id,

        position:
          rawPosition
            ? Number(rawPosition)
            : null,
      };
    });

  const invalidAssignment =
    assignments.find(
      (assignment) =>
        assignment.position === null ||
        !Number.isInteger(
          assignment.position,
        ) ||
        assignment.position < 1 ||
        assignment.position >
          circle.members.length,
    );

  if (invalidAssignment) {
    return {
      error:
        "Every active member must have a valid payout position.",
    };
  }

  const positions =
    assignments.map(
      (assignment) =>
        assignment.position as number,
    );

  const uniquePositions =
    new Set(positions);

  if (
    uniquePositions.size !==
    positions.length
  ) {
    return {
      error:
        "Each member must have a unique payout position.",
    };
  }

  await prisma.$transaction(
    assignments.map(
      (assignment) =>
        prisma.circleMember.update({
          where: {
            id: assignment.memberId,
          },

          data: {
            payoutPosition:
              assignment.position,
          },
        }),
    ),
  );

  revalidatePath(
    `/circles/${circleId}`,
  );

  revalidatePath(
    `/circles/${circleId}/payout-order`,
  );

  return {
    success:
      "Payout order updated successfully.",
  };
}