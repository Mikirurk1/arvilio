import { createHmac, timingSafeEqual } from 'crypto';

type PaddleCreateCheckoutParams = {
  apiKey: string;
  apiBaseUrl: string;
  amountMinor: number;
  currency: string;
  title: string;
  description: string;
  redirectUrl: string;
  customData: Record<string, string>;
};

type PaddleResponse = {
  data?: {
    id?: string;
    checkout?: {
      url?: string | null;
    };
  };
  error?: {
    detail?: string;
    errors?: Array<{ detail?: string }>;
  };
};

export function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  secret: string,
): boolean {
  const header = (signatureHeader ?? '').trim();
  if (!header) return false;
  const parts = header.split(';').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('ts='))?.slice(3);
  const signatures = parts
    .filter((part) => part.startsWith('h1='))
    .map((part) => part.slice(3))
    .filter(Boolean);
  if (!timestamp || signatures.length === 0) return false;

  const expected = Buffer.from(
    createHmac('sha256', secret).update(`${timestamp}:${rawBody}`).digest('hex'),
    'hex',
  );
  return signatures.some((signature) => {
    const provided = Buffer.from(signature, 'hex');
    return provided.length > 0 &&
      provided.length === expected.length &&
      timingSafeEqual(provided, expected);
  });
}

export async function createPaddleCheckout({
  apiKey,
  apiBaseUrl,
  amountMinor,
  currency,
  title,
  description,
  redirectUrl,
  customData,
}: PaddleCreateCheckoutParams): Promise<{ id: string; url: string }> {
  const response = await fetch(`${apiBaseUrl}/transactions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      collection_mode: 'automatic',
      items: [
        {
          quantity: 1,
          price: {
            type: 'custom',
            name: title,
            description,
            tax_mode: 'account_setting',
            unit_price: {
              amount: String(amountMinor),
              currency_code: currency,
            },
            product: {
              name: 'Arvilio lessons',
              description: 'Lesson balance top-up',
              tax_category: 'standard',
            },
          },
        },
      ],
      custom_data: customData,
      checkout: {
        url: redirectUrl,
      },
    }),
  });

  const body = (await response.json().catch(() => null)) as PaddleResponse | null;
  const id = body?.data?.id?.trim();
  const url = body?.data?.checkout?.url?.trim();
  if (!response.ok || !id || !url) {
    const message = body?.error?.detail || body?.error?.errors?.[0]?.detail;
    throw new Error(message || 'Paddle did not return a checkout URL');
  }
  return { id, url };
}
