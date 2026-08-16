-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CIRCLE_CREATED', 'CIRCLE_UPDATED', 'INVITE_CODE_CHANGED', 'MEMBER_JOINED', 'MEMBER_PROMOTED', 'MEMBER_DEMOTED', 'MEMBER_REMOVED', 'CIRCLE_STARTED', 'CONTRIBUTION_PAID', 'CONTRIBUTION_RESET', 'PAYOUT_COMPLETED', 'CIRCLE_COMPLETED');

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "savingsCircleId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_savingsCircleId_idx" ON "ActivityLog"("savingsCircleId");

-- CreateIndex
CREATE INDEX "ActivityLog_actorUserId_idx" ON "ActivityLog"("actorUserId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_savingsCircleId_fkey" FOREIGN KEY ("savingsCircleId") REFERENCES "SavingsCircle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
