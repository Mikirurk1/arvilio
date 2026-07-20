import { isFieldEditable } from './profile-field-policy';
import type { ProfileFormContext } from './unified-profile-types';

export function fieldDisabled(
  field: Parameters<typeof isFieldEditable>[0],
  resolvedContext: ProfileFormContext,
  fieldsDisabled: boolean,
): boolean {
  return !isFieldEditable(field, resolvedContext, fieldsDisabled);
}
