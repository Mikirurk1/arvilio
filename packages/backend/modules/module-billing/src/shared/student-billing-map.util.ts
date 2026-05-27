import type {
  LessonPackageDto,
  PaymentConfigDto,
  ResolvedLessonPackageDto,
  StudentBillingModeDto,
  StudentPackageOverrideDto,
} from '@pkg/types';
import { DEFAULT_MIN_PACKAGE_LESSONS, getPricePerLessonForCurrency } from '@pkg/types';

type StudentBillingModeDb = 'PER_LESSON' | 'PACKAGES' | 'BOTH';

export function billingModeToDto(mode: StudentBillingModeDb): StudentBillingModeDto {
  if (mode === 'PER_LESSON') return 'per_lesson';
  if (mode === 'PACKAGES') return 'packages';
  return 'both';
}

export function billingModeFromDto(mode: StudentBillingModeDto): StudentBillingModeDb {
  if (mode === 'per_lesson') return 'PER_LESSON';
  if (mode === 'packages') return 'PACKAGES';
  return 'BOTH';
}

export function parsePackageOverrides(raw: unknown): StudentPackageOverrideDto[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((row): row is Record<string, unknown> => !!row && typeof row === 'object')
    .map((row) => ({
      packageId: String(row['packageId'] ?? ''),
      lessons:
        row['lessons'] != null && Number.isFinite(Number(row['lessons']))
          ? Math.max(1, Math.round(Number(row['lessons'])))
          : null,
      lessonsLocked: row['lessonsLocked'] === true,
      enabled: row['enabled'] !== false,
    }))
    .filter((row) => row.packageId.length > 0);
}

export function packageOverridesToJson(
  overrides: StudentPackageOverrideDto[],
): Array<Record<string, unknown>> {
  return overrides.map((o) => ({
    packageId: o.packageId,
    lessons: o.lessons,
    lessonsLocked: o.lessonsLocked,
    enabled: o.enabled,
  }));
}

export function resolveStudentPackages(
  config: PaymentConfigDto,
  pricePerLessonMinor: number,
  isCustomPrice: boolean,
  billingMode: StudentBillingModeDto,
  overrides: StudentPackageOverrideDto[],
): ResolvedLessonPackageDto[] {
  if (billingMode === 'per_lesson') return [];

  const minLessons = config['minPackageLessons'] ?? DEFAULT_MIN_PACKAGE_LESSONS;
  const overrideById = new Map(overrides.map((o) => [o.packageId, o]));

  return config['packages']
    .map((platformPkg) => {
      const ov = overrideById.get(platformPkg.id);
      if (ov && !ov.enabled) return null;

      const lessons = ov?.lessons ?? platformPkg.lessons;
      if (lessons < minLessons) return null;

      const currency = platformPkg.currency ?? config['defaultCurrency'];
      const lessonsLocked = ov?.lessonsLocked === true;
      const resolvedPricePerLessonMinor = isCustomPrice
        ? pricePerLessonMinor
        : getPricePerLessonForCurrency(config, currency);

      return {
        id: platformPkg.id,
        lessons,
        label: platformPkg.label,
        currency,
        pricePerLessonMinor: resolvedPricePerLessonMinor,
        amountMinor: lessons * resolvedPricePerLessonMinor,
        isCustomPrice,
        lessonsLocked,
      };
    })
    .filter((p): p is ResolvedLessonPackageDto => p != null);
}

export function mergeOverridesWithPlatformPackages(
  platformPackages: LessonPackageDto[],
  existing: StudentPackageOverrideDto[],
): StudentPackageOverrideDto[] {
  const byId = new Map(existing.map((o) => [o.packageId, o]));
  return platformPackages.map((pkg) => {
    const prev = byId.get(pkg.id);
    return {
      packageId: pkg.id,
      lessons: prev?.lessons ?? null,
      lessonsLocked: prev?.lessonsLocked ?? false,
      enabled: prev?.enabled ?? true,
    };
  });
}
