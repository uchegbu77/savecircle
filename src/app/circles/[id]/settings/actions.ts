"use server";

import { revalidatePath } from "next/cache";

import { auth } from "../../../../auth";
import { generateInviteCode } from "../../../../lib/invite-code";
import { prisma } from "../../../../lib/prisma";
import { createActivityLog } from "../../../../lib/activity-log";

export type CircleSettingsState = {
  error?: string;
  success?: string;
};

async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("You must be logged in.");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    throw new Error("User account not found.");
  }

  return user;
}

export async function updateCircleSettings(
  circleId: string,
  previousState: CircleSettingsState,
  formData: FormData,
): Promise<CircleSettingsState> {
  try {
    const user = await getCurrentUser();

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
        error: "Savings circle not found.",
      };
    }

    if (circle.ownerId !== user.id) {
      return {
        error:
          "Only the circle owner can change these settings.",
      };
    }

    if (circle.status !== "DRAFT") {
      return {
        error:
          "Circle settings cannot be changed after the circle has started.",
      };
    }

    const name =
      formData.get("name")?.toString().trim() ?? "";

    const description =
      formData
        .get("description")
        ?.toString()
        .trim() ?? "";

    const contributionAmount =
      Number(
        formData
          .get("contributionAmount")
          ?.toString(),
      );

    const frequency =
      formData.get("frequency")?.toString();

    const startDate =
      formData.get("startDate")?.toString();

    const maxMembers =
      Number(
        formData
          .get("maxMembers")
          ?.toString(),
      );

    if (name.length < 3) {
      return {
        error:
          "Circle name must contain at least 3 characters.",
      };
    }

    if (
      !Number.isFinite(
        contributionAmount,
      ) ||
      contributionAmount <= 0
    ) {
      return {
        error:
          "Enter a valid contribution amount.",
      };
    }

    if (
      frequency !== "WEEKLY" &&
      frequency !== "MONTHLY"
    ) {
      return {
        error:
          "Select a valid contribution frequency.",
      };
    }

    if (!startDate) {
      return {
        error:
          "Select a valid start date.",
      };
    }

    if (
      !Number.isInteger(maxMembers) ||
      maxMembers < 2 ||
      maxMembers > 50
    ) {
      return {
        error:
          "Maximum members must be between 2 and 50.",
      };
    }

    if (
      maxMembers <
      circle.members.length
    ) {
      return {
        error:
          `The circle already has ${circle.members.length} active members. Maximum members cannot be lower than that.`,
      };
    }

    await prisma.$transaction(
  async (transaction) => {
    await transaction.savingsCircle.update({
      where: {
        id: circle.id,
      },

      data: {
        name,
        description:
          description || null,
        contributionAmount,
        frequency,
        startDate:
          new Date(startDate),
        maxMembers,
      },
    });

    await createActivityLog({
      transaction,
      circleId: circle.id,
      actorUserId: user.id,
      type: "CIRCLE_UPDATED",
      title:
        "Circle settings updated",
      description:
        `${user.firstName} ${user.lastName} updated the savings circle settings.`,
    });
  },
);

    revalidateCirclePaths(
      circleId,
    );

    return {
      success:
        "Circle settings updated successfully.",
    };
  } catch (error) {
    console.error(
      "Failed to update circle:",
      error,
    );

    return {
      error:
        "The circle settings could not be updated.",
    };
  }
}

export async function regenerateInviteCode(
  circleId: string,
): Promise<void> {
  const user =
    await getCurrentUser();

  const circle =
    await prisma.savingsCircle.findUnique({
      where: {
        id: circleId,
      },
    });

  if (!circle) {
    throw new Error(
      "Savings circle not found.",
    );
  }

  if (circle.ownerId !== user.id) {
    throw new Error(
      "Only the circle owner can regenerate the invite code.",
    );
  }

  if (circle.status !== "DRAFT") {
    throw new Error(
      "Invite codes cannot be regenerated after the circle has started.",
    );
  }

  const inviteCode =
    await createUniqueInviteCode();

 await prisma.$transaction(
  async (transaction) => {
    await transaction.savingsCircle.update({
      where: {
        id: circle.id,
      },

      data: {
        inviteCode,
      },
    });

    await createActivityLog({
      transaction,
      circleId: circle.id,
      actorUserId: user.id,
      type:
        "INVITE_CODE_CHANGED",
      title:
        "Invite code changed",
      description:
        `${user.firstName} ${user.lastName} generated a new invite code.`,
    });
  },
);

  revalidateCirclePaths(
    circleId,
  );
}

async function createUniqueInviteCode() {
  for (
    let attempt = 0;
    attempt < 10;
    attempt++
  ) {
    const inviteCode =
      generateInviteCode();

    const existing =
      await prisma.savingsCircle.findUnique({
        where: {
          inviteCode,
        },
      });

    if (!existing) {
      return inviteCode;
    }
  }

  throw new Error(
    "Unable to generate a new invite code.",
  );
}

function revalidateCirclePaths(
  circleId: string,
) {
  revalidatePath(
    `/circles/${circleId}`,
  );

  revalidatePath(
    `/circles/${circleId}/settings`,
  );

  revalidatePath(
    `/circles/${circleId}/payout-order`,
  );

  revalidatePath("/circles");
  revalidatePath("/dashboard");
}