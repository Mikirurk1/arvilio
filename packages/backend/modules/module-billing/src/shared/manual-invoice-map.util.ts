import type {
  ManualInvoiceMethodDto,
  ManualInvoiceMethodKindDto,
  StudentManualInvoiceSelectionDto,
} from '@pkg/types';
import { isManualInvoiceMethodConfigured as isManualInvoiceMethodConfiguredShared } from '@pkg/types';
import type {
  ManualInvoiceCustomMethodDto,
  ManualInvoiceCardMethodDto,
  ManualInvoiceIbanMethodDto,
  ManualInvoiceSwiftMethodDto,
} from '@pkg/types';

export const DEFAULT_STUDENT_MANUAL_INVOICE_SELECTION: StudentManualInvoiceSelectionDto = {
  allowedMethodIds: [],
  defaultMethodId: null,
};

const LEGACY_MANUAL_METHOD_ID = 'manual-legacy';

function cleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanNullableString(value: unknown): string | null {
  const cleaned = cleanString(value);
  return cleaned ? cleaned : null;
}

function cleanStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => cleanString(item)).filter(Boolean))];
}

function baseMethodFromRaw<K extends ManualInvoiceMethodKindDto>(
  raw: Record<string, unknown>,
  kind: K,
) {
  const label = cleanString(raw['label']);
  const description = cleanString(raw['description']);
  const receiptHintUk = cleanString(raw['receiptHintUk']);
  const paymentReferenceHint = cleanString(raw['paymentReferenceHint']);
  const id = cleanString(raw['id']);
  return {
    id,
    kind,
    label,
    description,
    receiptHintUk,
    paymentReferenceHint,
    recipientTaxId: cleanNullableString(raw['recipientTaxId']),
    paymentPurpose: cleanNullableString(raw['paymentPurpose']),
    importantNotes: cleanStringList(raw['importantNotes']),
  };
}

function parseMethod(raw: unknown): ManualInvoiceMethodDto | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const kind = cleanString(obj['kind']) as ManualInvoiceMethodKindDto;

  if (kind === 'iban_sepa') {
    const method: ManualInvoiceIbanMethodDto = {
      ...baseMethodFromRaw(obj, kind),
      beneficiaryName: cleanString(obj['beneficiaryName']),
      iban: cleanString(obj['iban']).toUpperCase(),
      bankName: cleanNullableString(obj['bankName']),
      bankCountry: cleanNullableString(obj['bankCountry']),
      bic: cleanNullableString(obj['bic'])?.toUpperCase() ?? null,
    };
    return method.id ? method : null;
  }

  if (kind === 'swift_wire') {
    const method: ManualInvoiceSwiftMethodDto = {
      ...baseMethodFromRaw(obj, kind),
      beneficiaryName: cleanString(obj['beneficiaryName']),
      accountNumber: cleanString(obj['accountNumber']),
      iban: cleanNullableString(obj['iban'])?.toUpperCase() ?? null,
      bankName: cleanNullableString(obj['bankName']),
      bankAddress: cleanNullableString(obj['bankAddress']),
      swiftBic: cleanString(obj['swiftBic']).toUpperCase(),
      beneficiaryAddress: cleanNullableString(obj['beneficiaryAddress']),
      intermediaryBankName: cleanNullableString(obj['intermediaryBankName']),
      intermediarySwiftBic: cleanNullableString(obj['intermediarySwiftBic'])?.toUpperCase() ?? null,
    };
    return method.id ? method : null;
  }

  if (kind === 'card_transfer') {
    const method: ManualInvoiceCardMethodDto = {
      ...baseMethodFromRaw(obj, kind),
      beneficiaryName: cleanString(obj['beneficiaryName']),
      bankName: cleanString(obj['bankName']),
      cardNumber: cleanString(obj['cardNumber']),
    };
    return method.id ? method : null;
  }

  if (kind === 'custom') {
    const method: ManualInvoiceCustomMethodDto = {
      ...baseMethodFromRaw(obj, kind),
      instructionsUk: cleanString(obj['instructionsUk']),
    };
    return method.id ? method : null;
  }

  return null;
}

export function createLegacyManualInvoiceMethod(legacy: {
  instructionsUk?: unknown;
  receiptHintUk?: unknown;
}): ManualInvoiceMethodDto | null {
  const instructionsUk = cleanString(legacy.instructionsUk);
  const receiptHintUk = cleanString(legacy.receiptHintUk);
  if (!instructionsUk && !receiptHintUk) return null;
  return {
    id: LEGACY_MANUAL_METHOD_ID,
    kind: 'custom',
    label: 'Manual invoice',
    description: 'Legacy manual payment instructions.',
    receiptHintUk,
    paymentReferenceHint: '',
    recipientTaxId: null,
    paymentPurpose: null,
    importantNotes: [],
    instructionsUk,
  };
}

export function parseManualInvoiceMethods(
  raw: unknown,
  legacyManual?: { instructionsUk?: unknown; receiptHintUk?: unknown } | null,
): ManualInvoiceMethodDto[] {
  const parsed = Array.isArray(raw)
    ? raw.map(parseMethod).filter((method): method is ManualInvoiceMethodDto => method !== null)
    : [];
  if (parsed.length > 0) return dedupeManualInvoiceMethods(parsed);
  const legacy = legacyManual ? createLegacyManualInvoiceMethod(legacyManual) : null;
  return legacy ? [legacy] : [];
}

export function manualInvoiceMethodsToJson(
  methods: ManualInvoiceMethodDto[],
): Array<Record<string, unknown>> {
  return dedupeManualInvoiceMethods(methods).map((method) => ({ ...method }));
}

export function isManualInvoiceMethodConfigured(method: ManualInvoiceMethodDto): boolean {
  return isManualInvoiceMethodConfiguredShared(method);
}

export function parseStudentManualInvoiceSelection(
  raw: unknown,
): StudentManualInvoiceSelectionDto {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_STUDENT_MANUAL_INVOICE_SELECTION };
  const obj = raw as Record<string, unknown>;
  const allowedMethodIds = Array.isArray(obj['allowedMethodIds'])
    ? [...new Set(obj['allowedMethodIds'].map((value) => cleanString(value)).filter(Boolean))]
    : [];
  const defaultMethodId = cleanNullableString(obj['defaultMethodId']);
  return {
    allowedMethodIds,
    defaultMethodId,
  };
}

export function studentManualInvoiceSelectionToJson(
  selection: StudentManualInvoiceSelectionDto,
): Record<string, unknown> {
  return {
    allowedMethodIds: [...new Set(selection['allowedMethodIds'].map((value) => value.trim()).filter(Boolean))],
    defaultMethodId: selection['defaultMethodId']?.trim() || null,
  };
}

export function validateStudentManualInvoiceSelection(
  methods: ManualInvoiceMethodDto[],
  selection: StudentManualInvoiceSelectionDto,
  options?: { strict?: boolean },
): StudentManualInvoiceSelectionDto {
  const validIds = new Set(methods.map((method) => method.id));
  const allowedMethodIds = selection['allowedMethodIds'].filter((id) => validIds.has(id));
  let defaultMethodId =
    selection['defaultMethodId'] && validIds.has(selection['defaultMethodId'])
      ? selection['defaultMethodId']
      : null;

  if (defaultMethodId && allowedMethodIds.length > 0 && !allowedMethodIds.includes(defaultMethodId)) {
    if (options?.strict) {
      throw new Error('default manual invoice method must be included in allowedMethodIds');
    }
    defaultMethodId = null;
  }

  return {
    allowedMethodIds,
    defaultMethodId,
  };
}

export function resolveStudentManualInvoiceMethods(
  methods: ManualInvoiceMethodDto[],
  selection: StudentManualInvoiceSelectionDto,
): ManualInvoiceMethodDto[] {
  const allowed =
    selection['allowedMethodIds'].length > 0
      ? methods.filter((method) => selection['allowedMethodIds'].includes(method.id))
      : methods;
  return sortManualInvoiceMethods(allowed, selection['defaultMethodId']);
}

function sortManualInvoiceMethods(
  methods: ManualInvoiceMethodDto[],
  defaultMethodId: string | null,
): ManualInvoiceMethodDto[] {
  return [...methods].sort((left, right) => {
    if (defaultMethodId) {
      if (left.id === defaultMethodId && right.id !== defaultMethodId) return -1;
      if (right.id === defaultMethodId && left.id !== defaultMethodId) return 1;
    }
    return left.label.localeCompare(right.label);
  });
}

function dedupeManualInvoiceMethods(methods: ManualInvoiceMethodDto[]): ManualInvoiceMethodDto[] {
  const byId = new Map<string, ManualInvoiceMethodDto>();
  for (const method of methods) {
    if (!method.id.trim()) continue;
    byId.set(method.id, method);
  }
  return [...byId.values()];
}
