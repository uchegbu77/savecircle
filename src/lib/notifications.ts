import type {
  NotificationPriority,
  NotificationType,
} from "../generated/prisma/client";

import { prisma } from "../lib/prisma";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  priority?: NotificationPriority;
};

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  priority = "NORMAL",
}: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link: link || null,
      priority,
    },
  });
}