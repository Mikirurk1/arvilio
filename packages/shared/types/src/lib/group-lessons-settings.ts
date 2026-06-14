import type { GroupFixedSplitMode, GroupLessonBillingMode } from './group-lesson';

/** Platform-wide group lessons feature (stored in paymentConfig JSON). */
export type SchoolGroupLessonsSettingsDto = {
  enabled: boolean;
  defaultBillingMode: GroupLessonBillingMode;
  defaultPriceMinor: number;
  defaultCurrency: string;
  defaultSplitMode: GroupFixedSplitMode;
};

export const GROUP_LESSONS_FEATURE_DISABLED_MESSAGE =
  'Group lessons are not enabled for this school';

export const DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS: SchoolGroupLessonsSettingsDto = {
  enabled: false,
  defaultBillingMode: 'per_member',
  defaultPriceMinor: 0,
  defaultCurrency: 'UAH',
  defaultSplitMode: 'equal_split',
};

export function parseSchoolGroupLessonsSettings(
  raw: unknown,
  fallbackCurrency = 'UAH',
): SchoolGroupLessonsSettingsDto {
  const base = {
    ...DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS,
    defaultCurrency: fallbackCurrency,
  };
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Record<string, unknown>;
  const defaultBillingMode =
    obj['defaultBillingMode'] === 'fixed_total' ? 'fixed_total' : 'per_member';
  const defaultSplitMode =
    obj['defaultSplitMode'] === 'single_payer' ? 'single_payer' : 'equal_split';
  return {
    enabled: obj['enabled'] === true,
    defaultBillingMode,
    defaultPriceMinor:
      typeof obj['defaultPriceMinor'] === 'number'
        ? Math.max(0, Math.round(obj['defaultPriceMinor']))
        : base.defaultPriceMinor,
    defaultCurrency:
      typeof obj['defaultCurrency'] === 'string' && obj['defaultCurrency'].trim()
        ? obj['defaultCurrency'].trim().toUpperCase()
        : fallbackCurrency,
    defaultSplitMode,
  };
}

export function schoolGroupLessonsToJson(
  settings: SchoolGroupLessonsSettingsDto,
): Record<string, unknown> {
  return {
    enabled: settings.enabled,
    defaultBillingMode: settings.defaultBillingMode,
    defaultPriceMinor: settings.defaultPriceMinor,
    defaultCurrency: settings.defaultCurrency,
    defaultSplitMode: settings.defaultSplitMode,
  };
}

export function isGroupLessonsEnabled(config: { groupLessons?: SchoolGroupLessonsSettingsDto }): boolean {
  return config.groupLessons?.enabled === true;
}
