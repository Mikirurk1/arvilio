import { createPublicKey, createVerify } from 'crypto';

type MonoPayCreateInvoiceParams = {
  apiBaseUrl: string;
  token: string;
  amountMinor: number;
  currency: string;
  reference: string;
  destination: string;
  comment: string;
  redirectUrl: string;
  webHookUrl: string;
};

type MonoPayCreateInvoiceResponse = {
  invoiceId?: string;
  pageUrl?: string;
  errText?: string;
  status?: string;
};

const MONOPAY_CURRENCY_CODES: Record<string, number> = {
  UAH: 980,
  USD: 840,
  EUR: 978,
};

const monoPayPublicKeyCache = new Map<string, string>();

export function monoPayCurrencyCodeFromIso(currency: string): number | null {
  return MONOPAY_CURRENCY_CODES[currency.trim().toUpperCase()] ?? null;
}

export function verifyMonoPaySignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  publicKeyBase64: string,
): boolean {
  const signature = (signatureHeader ?? '').trim();
  const key = publicKeyBase64.trim();
  if (!signature || !key) return false;
  try {
    const publicKeyPem = Buffer.from(key, 'base64');
    const verifier = createVerify('sha256');
    verifier.update(rawBody);
    verifier.end();
    return verifier.verify(createPublicKey(publicKeyPem), Buffer.from(signature, 'base64'));
  } catch {
    return false;
  }
}

export async function fetchMonoPayPublicKey(
  apiBaseUrl: string,
  token: string,
  forceRefresh = false,
): Promise<string> {
  const cacheKey = `${apiBaseUrl}::${token}`;
  if (!forceRefresh) {
    const cached = monoPayPublicKeyCache.get(cacheKey);
    if (cached) return cached;
  }
  const response = await fetch(`${apiBaseUrl}/api/merchant/pubkey`, {
    method: 'GET',
    headers: {
      'X-Token': token,
      Accept: 'text/plain, application/json',
    },
  });
  const rawText = (await response.text()).trim();
  if (!response.ok || !rawText) {
    throw new Error(rawText || 'MonoPay did not return a public key');
  }
  const key = rawText.replace(/^"+|"+$/g, '');
  monoPayPublicKeyCache.set(cacheKey, key);
  return key;
}

export async function createMonoPayCheckout({
  apiBaseUrl,
  token,
  amountMinor,
  currency,
  reference,
  destination,
  comment,
  redirectUrl,
  webHookUrl,
}: MonoPayCreateInvoiceParams): Promise<{ invoiceId: string; pageUrl: string }> {
  const ccy = monoPayCurrencyCodeFromIso(currency);
  if (ccy == null) {
    throw new Error(`MonoPay does not support currency ${currency}`);
  }

  const response = await fetch(`${apiBaseUrl}/api/merchant/invoice/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Token': token,
    },
    body: JSON.stringify({
      amount: amountMinor,
      ccy,
      redirectUrl,
      webHookUrl,
      merchantPaymInfo: {
        reference,
        destination,
        comment,
      },
    }),
  });

  const body = (await response.json().catch(() => null)) as MonoPayCreateInvoiceResponse | null;
  const invoiceId = body?.invoiceId?.trim();
  const pageUrl = body?.pageUrl?.trim();
  if (!response.ok || !invoiceId || !pageUrl) {
    throw new Error(body?.errText || body?.status || 'MonoPay did not return a checkout URL');
  }
  return { invoiceId, pageUrl };
}
