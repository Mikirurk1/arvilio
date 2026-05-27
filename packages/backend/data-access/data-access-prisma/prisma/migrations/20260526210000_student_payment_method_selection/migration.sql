-- AlterTable
ALTER TABLE "StudentLessonBalance" ADD COLUMN "paymentMethodSelection" JSONB;

-- Backfill rows for students who had a legacy singular assigned payment method.
INSERT INTO "StudentLessonBalance" ("userId", "balance", "paymentMethodSelection", "updatedAt")
SELECT
  "User"."id",
  0,
  jsonb_build_object(
    'allowedMethods',
    jsonb_build_array(
      CASE "User"."assignedPaymentMethod"
        WHEN 'MANUAL_INVOICE' THEN 'manual_invoice'
        WHEN 'STRIPE' THEN 'stripe'
        WHEN 'LIQPAY' THEN 'liqpay'
        WHEN 'WAYFORPAY' THEN 'wayforpay'
        WHEN 'LEMON_SQUEEZY' THEN 'lemonsqueezy'
        WHEN 'PADDLE' THEN 'paddle'
        WHEN 'MONOPAY' THEN 'monopay'
        WHEN 'PAYPAL' THEN 'paypal'
      END
    )
  ),
  NOW()
FROM "User"
LEFT JOIN "StudentLessonBalance"
  ON "StudentLessonBalance"."userId" = "User"."id"
WHERE "User"."role" = 'STUDENT'
  AND "User"."assignedPaymentMethod" IS NOT NULL
  AND "StudentLessonBalance"."userId" IS NULL;

UPDATE "StudentLessonBalance"
SET "paymentMethodSelection" = jsonb_build_object(
  'allowedMethods',
  jsonb_build_array(
    CASE "User"."assignedPaymentMethod"
      WHEN 'MANUAL_INVOICE' THEN 'manual_invoice'
      WHEN 'STRIPE' THEN 'stripe'
      WHEN 'LIQPAY' THEN 'liqpay'
      WHEN 'WAYFORPAY' THEN 'wayforpay'
      WHEN 'LEMON_SQUEEZY' THEN 'lemonsqueezy'
      WHEN 'PADDLE' THEN 'paddle'
      WHEN 'MONOPAY' THEN 'monopay'
      WHEN 'PAYPAL' THEN 'paypal'
    END
  )
)
FROM "User"
WHERE "StudentLessonBalance"."userId" = "User"."id"
  AND "User"."role" = 'STUDENT'
  AND "User"."assignedPaymentMethod" IS NOT NULL
  AND "StudentLessonBalance"."paymentMethodSelection" IS NULL;

-- Remove legacy singular per-student payment restriction.
ALTER TABLE "User" DROP COLUMN "assignedPaymentMethod";
