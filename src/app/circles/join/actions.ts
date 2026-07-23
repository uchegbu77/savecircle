"use server";

import { redirect } from "next/navigation";

import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { validateInviteCode } from "../../../lib/validation";

export type JoinCircleState = {
  error?: string;
};

export async function joinCircle(
  previousState: JoinCircleState,
  formData: FormData,
): Promise<JoinCircleState> {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      error:
        "You must be logged in to join a savings circle.",
    };
  }

  const inviteCode =
    formData
      .get("inviteCode")
      ?.toString()
      .trim()
      .toUpperCase() ?? "";

  const validationError =
    validateInviteCode(inviteCode);

  if (validationError) {
    return {
      error: validationError,
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
      error:
        "Your user account could not be found.",
    };
  }

  const circle =
    await prisma.savingsCircle.findUnique({
      where: {
        inviteCode,
      },
    });

  if (!circle) {
    return {
      error:
        "No savings circle was found with this invite code.",
    };
  }

  const existingMembership =
    await prisma.circleMember.findUnique({
      where: {
        userId_savingsCircleId: {
          userId: user.id,
          savingsCircleId:
            circle.id,
        },
      },
    });

  if (existingMembership) {
    if (
      existingMembership.status ===
      "ACTIVE"
    ) {
      return {
        error:
          "You are already a member of this savings circle.",
      };
    }

    await prisma.circleMember.update({
      where: {
        id: existingMembership.id,
      },

      data: {
        status: "ACTIVE",
        joinedAt: new Date(),
      },
    });

    redirect(
      `/circles/${circle.id}`,
    );
  }

  await prisma.circleMember.create({
    data: {
      userId: user.id,
      savingsCircleId: circle.id,
      role: "MEMBER",
      status: "ACTIVE",
    },
  });

  redirect(
    `/circles/${circle.id}`,
  );
}