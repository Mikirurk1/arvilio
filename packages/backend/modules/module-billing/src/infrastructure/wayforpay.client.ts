import { createHmac, timingSafeEqual } from 'crypto';

const WAYFORPAY_CHECKOUT_URL = 'https://secure.wayforpay.com/pay?behavior=offline';

export type WayForPayPurchaseRequest = {
  merchantAccount: string;
  merchantDomainName: string;
  orderReference: string;
  orderDate: number;
  amount: string;
  currency: string;
  productName: string[];
  productCount: number[];
  productPrice: string[];
  returnUrl: string;
  serviceUrl: string;
  language?: 'UA' | 'EN';
  merchantTransactionType?: 'AUTO';
};

export type WayForPayCallbackPayload = {
  merchantAccount?: string;
  orderReference?: string;
  merchantSignature?: string;
  amount?: string | number;
  currency?: string;
  authCode?: string;
  cardPan?: string;
  transactionStatus?: string;
  reasonCode?: string | number;
  [key: string]: unknown;
};

function signWayForPayParts(parts: Array<string | number>, secretKey: string): string {
  return createHmac('md5', secretKey).update(parts.join(';'), 'utf8').digest('hex');
}

function secureHexEqual(left: string, right: string): boolean {
  const leftBuf = Buffer.from(left, 'hex');
  const rightBuf = Buffer.from(right, 'hex');
  if (leftBuf.length === 0 || leftBuf.length !== rightBuf.length) return false;
  return timingSafeEqual(leftBuf, rightBuf);
}

export function normalizeWayForPayDomain(value: string | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  try {
    return new URL(raw).hostname;
  } catch {
    return raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }
}

export function signWayForPayPurchase(
  payload: WayForPayPurchaseRequest,
  secretKey: string,
): string {
  return signWayForPayParts(
    [
      payload.merchantAccount,
      payload.merchantDomainName,
      payload.orderReference,
      payload.orderDate,
      payload.amount,
      payload.currency,
      ...payload.productName,
      ...payload.productCount,
      ...payload.productPrice,
    ],
    secretKey,
  );
}

export function verifyWayForPayCallback(
  payload: WayForPayCallbackPayload,
  secretKey: string,
): boolean {
  const signature = String(payload.merchantSignature ?? '').trim().toLowerCase();
  if (!signature) return false;
  const expected = signWayForPayParts(
    [
      String(payload.merchantAccount ?? ''),
      String(payload.orderReference ?? ''),
      String(payload.amount ?? ''),
      String(payload.currency ?? ''),
      String(payload.authCode ?? ''),
      String(payload.cardPan ?? ''),
      String(payload.transactionStatus ?? ''),
      String(payload.reasonCode ?? ''),
    ],
    secretKey,
  );
  return secureHexEqual(signature, expected);
}

export function buildWayForPayAck(orderReference: string, secretKey: string, time: number) {
  const status = 'accept';
  return {
    orderReference,
    status,
    time,
    signature: signWayForPayParts([orderReference, status, time], secretKey),
  };
}

export async function createWayForPayCheckout(
  payload: WayForPayPurchaseRequest,
  secretKey: string,
): Promise<string> {
  const form = new URLSearchParams();
  form.set('merchantAccount', payload.merchantAccount);
  form.set('merchantDomainName', payload.merchantDomainName);
  form.set('orderReference', payload.orderReference);
  form.set('orderDate', String(payload.orderDate));
  form.set('amount', payload.amount);
  form.set('currency', payload.currency);
  for (const value of payload.productName) form.append('productName[]', value);
  for (const value of payload.productCount) form.append('productCount[]', String(value));
  for (const value of payload.productPrice) form.append('productPrice[]', value);
  form.set('returnUrl', payload.returnUrl);
  form.set('serviceUrl', payload.serviceUrl);
  form.set('merchantSignature', signWayForPayPurchase(payload, secretKey));
  if (payload.language) form.set('language', payload.language);
  if (payload.merchantTransactionType) {
    form.set('merchantTransactionType', payload.merchantTransactionType);
  }

  const response = await fetch(WAYFORPAY_CHECKOUT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const body = (await response.json().catch(() => null)) as
    | { url?: string; reason?: string; reasonCode?: string | number }
    | null;
  if (!response.ok || !body?.url) {
    throw new Error(body?.reason || 'WayForPay did not return a checkout URL');
  }
  return body.url;
}
