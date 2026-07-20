export const MATERIAL_COMPRESS_LEVELS = ['off', 'light', 'balanced', 'strong'] as const;

export type MaterialCompressLevel = (typeof MATERIAL_COMPRESS_LEVELS)[number];

export const MATERIAL_COMPRESS_LEVEL_OPTIONS: Array<{
  value: MaterialCompressLevel;
  label: string;
  hint: string;
}> = [
  {
    value: 'balanced',
    label: 'Balanced',
    hint: 'Recommended — good quality with moderate size reduction (PDF ~150 dpi).',
  },
  {
    value: 'light',
    label: 'Light',
    hint: 'Best quality, larger files (PDF ~200 dpi).',
  },
  {
    value: 'strong',
    label: 'Strong',
    hint: 'Smallest files, lower quality (PDF ~96 dpi).',
  },
  {
    value: 'off',
    label: 'Off',
    hint: 'Store the original file without compression.',
  },
];

export function parseMaterialCompressLevel(raw: string | null | undefined): MaterialCompressLevel {
  const normalized = raw?.trim().toLowerCase();
  if (normalized && (MATERIAL_COMPRESS_LEVELS as readonly string[]).includes(normalized)) {
    return normalized as MaterialCompressLevel;
  }
  return 'balanced';
}

export function materialCompressLevelLabel(level: MaterialCompressLevel): string {
  return MATERIAL_COMPRESS_LEVEL_OPTIONS.find((option) => option.value === level)?.label ?? level;
}
