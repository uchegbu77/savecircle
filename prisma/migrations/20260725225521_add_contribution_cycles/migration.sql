-- CreateEnum
CREATE TYPE "ContributionCycleStatus" AS ENUM ('UPCOMING', 'OPEN', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'PAID', 'LATE', 'MISSED', 'WAIVED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'READY', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ContributionCycle" (
    "id" TEXT NOT NULL,
    "savingsCircleId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "expectedAmount" DECIMAL(10,2) NOT NULL,
    "payoutRecipientId" TEXT NOT NULL,
    "status" "ContributionCycleStatus" NOT NULL DEFAULT 'UPCOMING',
    "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "payoutCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amountDue" DECIMAL(10,2) NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContributionCycle_savingsCircleId_idx" ON "ContributionCycle"("savingsCircleId");

-- CreateIndex
CREATE INDEX "ContributionCycle_payoutRecipientId_idx" ON "ContributionCycle"("payoutRecipientId");

-- CreateIndex
CREATE INDEX "ContributionCycle_scheduledDate_idx" ON "ContributionCycle"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "ContributionCycle_savingsCircleId_cycleNumber_key" ON "ContributionCycle"("savingsCircleId", "cycleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ContributionCycle_savingsCircleId_payoutRecipientId_key" ON "ContributionCycle"("savingsCircleId", "payoutRecipientId");

-- CreateIndex
CREATE INDEX "Contribution_memberId_idx" ON "Contribution"("memberId");

-- CreateIndex
CREATE INDEX "Contribution_status_idx" ON "Contribution"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_cycleId_memberId_key" ON "Contribution"("cycleId", "memberId");

-- AddForeignKey
ALTER TABLE "ContributionCycle" ADD CONSTRAINT "ContributionCycle_savingsCircleId_fkey" FOREIGN KEY ("savingsCircleId") REFERENCES "SavingsCircle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionCycle" ADD CONSTRAINT "ContributionCycle_payoutRecipientId_fkey" FOREIGN KEY ("payoutRecipientId") REFERENCES "CircleMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ContributionCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "CircleMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
