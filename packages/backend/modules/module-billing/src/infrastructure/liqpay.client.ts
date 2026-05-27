import { createHash } from 'crypto';

export type LiqPayCheckoutPayload = {
  public_key: string;
  version: string;
  action: string;
  amount: number;
  currency: string;
  description: string;
  order_id: string;
  result_url: string;
  server_url: string;
  sandbox?: number;
};

export function encodeLiqPayData(payload: LiqPayCheckoutPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function signLiqPay(data: string, privateKey: string): string {
  const signatureBase = privateKey + data + privateKey;
  return createHash('sha1').update(signatureBase).digest('base64');
}

export function verifyLiqPaySignature(
  data: string,
  signature: string,
  privateKey: string,
): boolean {
  const expected = signLiqPay(data, privateKey);
  return expected === signature;
}

export function buildLiqPayCheckoutUrl(params: {
  data: string;
  signature: string;
  sandbox?: boolean;
}): string {
  const host = params.sandbox
    ? 'https://www.liqpay.ua/api/3/checkout'
    : 'https://www.liqpay.ua/api/3/checkout';
  const qs = new URLSearchParams({ data: params.data, signature: params.signature });
  return `${host}?${qs.toString()}`;
}

/** Decode LiqPay callback `data` field (base64 JSON). */
export function decodeLiqPayData<T extends Record<string, unknown>>(data: string): T {
  const json = Buffer.from(data, 'base64').toString('utf8');
  return JSON.parse(json) as T;
}
