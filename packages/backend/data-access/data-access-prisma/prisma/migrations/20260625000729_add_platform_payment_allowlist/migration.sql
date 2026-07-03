-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN     "allowedPaymentMethods" "PaymentMethodKind"[] DEFAULT ARRAY[]::"PaymentMethodKind"[];
