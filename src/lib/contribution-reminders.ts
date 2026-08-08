import { prisma } from "../lib/prisma";

export async function generateContributionReminders(
  userId: string,
) {
  const now = new Date();

  const upcomingLimit = new Date(now);

  upcomingLimit.setDate(
    upcomingLimit.getDate() + 7,
  );

  const contributions =
    await prisma.contribution.findMany({
      where: {
        member: {
          userId,
          status: "ACTIVE",
        },

        status: {
          in: [
            "PENDING",
            "LATE",
            "MISSED",
          ],
        },

        cycle: {
          status: "OPEN",

          scheduledDate: {
            lte: upcomingLimit,
          },

          savingsCircle: {
            status: "ACTIVE",
          },
        },
      },

      include: {
        cycle: {
          include: {
            savingsCircle: true,
          },
        },
      },
    });

  for (const contribution of contributions) {
    const reminderLink =
      `/circles/${contribution.cycle.savingsCircleId}` +
      `/cycles/${contribution.cycle.id}`;

    const existingReminder =
      await prisma.notification.findFirst({
        where: {
          userId,
          type: "CONTRIBUTION_DUE",
          link: reminderLink,
          isRead: false,
        },
      });

    if (existingReminder) {
      continue;
    }

    const isOverdue =
      contribution.cycle.scheduledDate <
      now;

    await prisma.notification.create({
      data: {
        userId,
        type: "CONTRIBUTION_DUE",

        title: isOverdue
          ? "Contribution overdue"
          : "Contribution due soon",

        message: isOverdue
          ? `Your contribution of £${Number(
              contribution.amountDue,
            ).toFixed(2)} for ${
              contribution.cycle
                .savingsCircle.name
            } is overdue.`
          : `Your contribution of £${Number(
              contribution.amountDue,
            ).toFixed(2)} for ${
              contribution.cycle
                .savingsCircle.name
            } is due on ${formatDate(
              contribution.cycle
                .scheduledDate,
            )}.`,

        link: reminderLink,

        priority: isOverdue
          ? "HIGH"
          : "NORMAL",
      },
    });
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}