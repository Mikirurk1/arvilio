/** HTML constraint attributes handled by app validation — not the browser. */
const NATIVE_VALIDATION_KEYS = [
  'required',
  'minLength',
  'maxLength',
  'min',
  'max',
  'pattern',
  'step',
] as const;

type NativeValidationKey = (typeof NATIVE_VALIDATION_KEYS)[number];

/** Remove browser-native constraint validation props before rendering controls. */
export function stripNativeValidationProps<T extends object>(props: T): Omit<T, NativeValidationKey> {
  const out = { ...props } as T & Partial<Record<NativeValidationKey, unknown>>;
  for (const key of NATIVE_VALIDATION_KEYS) {
    delete out[key];
  }
  return out as Omit<T, NativeValidationKey>;
}
