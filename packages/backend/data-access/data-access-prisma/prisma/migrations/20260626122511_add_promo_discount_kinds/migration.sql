-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PromoCodeKind" ADD VALUE 'PERCENT_OFF';
ALTER TYPE "PromoCodeKind" ADD VALUE 'FIXED_OFF';

-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN     "discountCurrency" TEXT,
ADD COLUMN     "discountFixed" INTEGER,
ADD COLUMN     "discountPercent" INTEGER,
ALTER COLUMN "trialDays" DROP NOT NULL;
