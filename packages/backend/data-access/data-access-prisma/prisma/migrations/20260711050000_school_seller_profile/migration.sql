-- AlterTable
ALTER TABLE "School" ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "legalAddress" TEXT,
ADD COLUMN     "legalCountry" TEXT,
ADD COLUMN     "supportEmail" TEXT,
ADD COLUMN     "supportPhone" TEXT,
ADD COLUMN     "mcc" TEXT DEFAULT '8299',
ADD COLUMN     "termsOverrideMd" TEXT,
ADD COLUMN     "paymentRefundOverrideMd" TEXT;
