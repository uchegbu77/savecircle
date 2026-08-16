import type {
  ActivityType,
  Prisma,
} from "../generated/prisma/client";

type ActivityTransaction =
  Prisma.TransactionClient;

type CreateActivityInput = {
  transaction: ActivityTransaction;
  circleId: string;
  actorUserId?: string | null;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createActivityLog({
  transaction,
  circleId,
  actorUserId,
  type,
  title,
  description,
  metadata,
}: CreateActivityInput) {
  return transaction.activityLog.create({
    data: {
      savingsCircleId: circleId,
      actorUserId:
        actorUserId ?? null,
      type,
      title,
      description,
      metadata,
    },
  });
}