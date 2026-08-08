"use server";

import { revalidatePath } from "next/cache";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("You must be logged in.");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },

    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("User account not found.");
  }

  const notification =
    await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

  if (!notification) {
    throw new Error("Notification not found.");
  }

  if (!notification.isRead) {
    await prisma.notification.update({
      where: {
        id: notification.id,
      },

      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  revalidateNotificationPaths();
}

export async function markAllNotificationsRead(): Promise<void> {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("You must be logged in.");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },

    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("User account not found.");
  }

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      isRead: false,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  revalidateNotificationPaths();
}

export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("You must be logged in.");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },

    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("User account not found.");
  }

  const notification =
    await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

  if (!notification) {
    throw new Error("Notification not found.");
  }

  await prisma.notification.delete({
    where: {
      id: notification.id,
    },
  });

  revalidateNotificationPaths();
}

function revalidateNotificationPaths() {
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}