"use server";

import { revalidatePath } from "next/cache";

import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { createActivityLog } from "../../../lib/activity-log";

async function getAuthorisedOwner(
  circleId: string,
) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const circle =
    await prisma.savingsCircle.findUnique({
      where: {
        id: circleId,
      },

      include: {
        owner: true,
      },
    });

  if (!circle) {
    throw new Error(
      "Savings circle not found.",
    );
  }

  if (
    circle.owner.email !==
    session.user.email
  ) {
    throw new Error(
      "Only the circle owner can manage members.",
    );
  }

  if (circle.status !== "DRAFT") {
    throw new Error(
      "Members cannot be changed after the circle starts.",
    );
  }

  return circle;
}

export async function promoteMember(
  circleId: string,
  memberId: string,
): Promise<void> {
  const circle = await getAuthorisedOwner(circleId);

  const member =
    await prisma.circleMember.findFirst({
      where: {
        id: memberId,
        savingsCircleId:
          circleId,
        status: "ACTIVE",
      },
      include: {
        user: true,
      },
    });

  if (!member) {
    throw new Error(
      "Member not found.",
    );
  }

  if (member.role === "OWNER") {
    throw new Error(
      "The owner role cannot be changed.",
    );
  }

 await prisma.$transaction(
  async (transaction) => {
    await transaction.circleMember.update({
      where: {
        id: member.id,
      },

      data: {
        role: "ADMIN",
      },
    });

    await createActivityLog({
      transaction,
      circleId,
      actorUserId: circle.ownerId,
      type: "MEMBER_PROMOTED",
      title:"Member promoted",
      description:  `${member.user.firstName} ${member.user.lastName}  was promoted to administrator.`,
    });
  },
);

  revalidateCircle(
    circleId,
  );
}

export async function demoteMember(
  circleId: string,
  memberId: string,
): Promise<void> {
  const circle = await getAuthorisedOwner(
    circleId,
  );

  const member = await prisma.circleMember.findFirst({
      where: {
        id: memberId,
        savingsCircleId:
          circleId,
        status: "ACTIVE",
      },
      include: {
        user: true,
      },
    });

  if (!member) {
    throw new Error(
      "Member not found.",
    );
  }

  if (member.role !== "ADMIN") {
    throw new Error(
      "Only administrators can be demoted.",
    );
  }

  await prisma.$transaction(
  async (transaction) => {
    await transaction.circleMember.update({
      where: {
        id: member.id,
      },

      data: {
        role: "MEMBER",
      },
    });

    await createActivityLog({
      transaction,
      circleId,
      actorUserId:
        circle.ownerId,
      type:
        "MEMBER_DEMOTED",
      title:
        "Administrator demoted",
      description:
        `${member.user.firstName} ${member.user.lastName} was changed back to a regular member.`,
    });
  },
);

  revalidateCircle(
    circleId,
  );
}

export async function removeMember(
  circleId: string,
  memberId: string,
): Promise<void> {
  const circle = await getAuthorisedOwner(
    circleId,
  );

  const member =
    await prisma.circleMember.findFirst({
      where: {
        id: memberId,
        savingsCircleId:
          circleId,
        status: "ACTIVE",
      },

      include: {
        user: true,
      },
    });

  if (!member) {
    throw new Error(
      "Member not found.",
    );
  }

  if (member.role === "OWNER") {
    throw new Error(
      "The circle owner cannot be removed.",
    );
  }

  await prisma.$transaction(
    async (transaction) => {
      await transaction.circleMember.update({
        where: { id: member.id },
        data: { status: "REMOVED", payoutPosition: null },
      });

      await createActivityLog({
        transaction,
        circleId,
        actorUserId: circle.ownerId,
        type: "MEMBER_REMOVED",
        title: "Member removed",
        description: `${member.user.firstName} ${member.user.lastName} was removed from the savings circle.`,
      });

      await transaction.notification.create({
        data: {
          userId: member.userId,
          type: "GENERAL",
          priority: "HIGH",
          title:"Removed from savings circle",
          message:"You were removed from a savings circle by its owner.",
          link: "/circles",
        },
      });
    },
  );

  revalidateCircle(
    circleId,
  );
}

function revalidateCircle(
  circleId: string,
) {
  revalidatePath(
    `/circles/${circleId}`,
  );

  revalidatePath(
    `/circles/${circleId}/payout-order`,
  );

  revalidatePath("/circles");
  revalidatePath("/dashboard");
}