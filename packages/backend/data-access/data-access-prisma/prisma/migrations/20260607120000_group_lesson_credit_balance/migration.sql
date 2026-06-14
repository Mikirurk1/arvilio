-- Separate prepaid credits for group per-member lessons vs individual lessons.

ALTER TABLE "StudentLessonBalance"
  ADD COLUMN "groupBalance" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "groupPricePerLessonMinor" INTEGER;

ALTER TYPE "LessonBalanceLedgerKind" ADD VALUE 'GROUP_PURCHASE';
ALTER TYPE "LessonBalanceLedgerKind" ADD VALUE 'GROUP_MANUAL_CREDIT';
ALTER TYPE "LessonBalanceLedgerKind" ADD VALUE 'GROUP_CONSUMPTION';
ALTER TYPE "LessonBalanceLedgerKind" ADD VALUE 'GROUP_REVERSAL';
