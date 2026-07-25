-- AlterTable
ALTER TABLE "CircleMember" ADD COLUMN     "payoutPosition" INTEGER;

-- AlterTable
ALTER TABLE "SavingsCircle" ADD COLUMN     "maxMembers" INTEGER NOT NULL DEFAULT 10;
