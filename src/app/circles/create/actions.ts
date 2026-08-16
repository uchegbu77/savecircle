"use server";

import { redirect } from "next/navigation";

import { auth } from "../../../auth";
import { generateInviteCode } from "../../../lib/invite-code";
import { prisma } from "../../../lib/prisma";
import { validateCreateCircle } from "../../../lib/validation";
import { createActivityLog } from "../../../lib/activity-log";

export type CreateCircleState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function createCircle(
  previousState: CreateCircleState,
  formData: FormData,
): Promise<CreateCircleState> {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      message:
        "You must be logged in to create a circle.",
    };
  }

  const name =
    formData.get("name")?.toString() ?? "";

  const description =
    formData
      .get("description")
      ?.toString() ?? "";

  const contributionAmount =
    formData
      .get("contributionAmount")
      ?.toString() ?? "";

  const frequency =
    formData
      .get("frequency")
      ?.toString() ?? "";

  const startDate =
    formData
      .get("startDate")
      ?.toString() ?? "";

  const maxMembers =
    formData
      .get("maxMembers")
      ?.toString() ?? "";

  const errors = validateCreateCircle({

    name,
    description,
    contributionAmount,
    frequency,
    startDate,
    maxMembers,
  });

  if (Object.keys(errors).length > 0) {
    return {
      errors,
    };
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

  if (!user) {
    return {
      message:
        "Your user account could not be found.",
    };
  }

  const inviteCode =
    await createUniqueInviteCode();

  const circle =
  await prisma.$transaction(
    async (transaction) => {
      const createdCircle =
        await transaction.savingsCircle.create({
          data: {
            name: name.trim(),

            description:
              description.trim() ||
              null,

            contributionAmount,

            frequency:
              frequency ===
              "WEEKLY"
                ? "WEEKLY"
                : "MONTHLY",

            startDate:
              new Date(startDate),

            maxMembers:
              Number(maxMembers),

            inviteCode,

            ownerId: user.id,

            members: {
              create: {
                userId: user.id,
                role: "OWNER",
                status: "ACTIVE",
                payoutPosition: 1,
              },
            },
          },
        });

      await createActivityLog({
        transaction,
        circleId:
          createdCircle.id,
        actorUserId: user.id,
        type: "CIRCLE_CREATED",
        title:
          "Savings circle created",
        description:
          `${user.firstName} ${user.lastName} created ${createdCircle.name}.`,
      });

      return createdCircle;
    },
  );

  redirect(`/circles/${circle.id}`);
}

async function createUniqueInviteCode() {
  for (
    let attempt = 0;
    attempt < 10;
    attempt++
  ) {
    const inviteCode =
      generateInviteCode();

    const existingCircle =
      await prisma.savingsCircle.findUnique({
        where: {
          inviteCode,
        },
      });

    if (!existingCircle) {
      return inviteCode;
    }
  }

  throw new Error(
    "Unable to generate a unique invite code.",
  );
}