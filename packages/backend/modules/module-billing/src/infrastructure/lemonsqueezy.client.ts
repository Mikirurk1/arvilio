import { createHmac, timingSafeEqual } from 'crypto';

const LEMONSQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1/checkouts';

type LemonCreateCheckoutParams = {
  apiKey: string;
  storeId: string;
  variantId: string;
  amountMinor: number;
  checkoutName: string;
  checkoutDescription: string;
  redirectUrl: string;
  customData: Record<string, string>;
  testMode: boolean;
  email?: string | null;
  name?: string | null;
};

type LemonCheckoutResponse = {
  data?: {
    id?: string;
    attributes?: {
      url?: string;
    };
  };
  errors?: Array<{ detail?: string; title?: string }>;
};

export function verifyLemonSqueezySignature(
  rawBody: string,
  signature: string | undefined,
  secret: string,
): boolean {
  const provided = Buffer.from((signature ?? '').trim(), 'hex');
  const expected = Buffer.from(
    createHmac('sha256', secret).update(rawBody).digest('hex'),
    'hex',
  );
  if (provided.length === 0 || provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

export async function createLemonSqueezyCheckout({
  apiKey,
  storeId,
  variantId,
  amountMinor,
  checkoutName,
  checkoutDescription,
  redirectUrl,
  customData,
  testMode,
  email,
  name,
}: LemonCreateCheckoutParams): Promise<{ id: string; url: string }> {
  const response = await fetch(LEMONSQUEEZY_API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          test_mode: testMode,
          custom_price: amountMinor,
          product_options: {
            name: checkoutName,
            description: checkoutDescription,
            redirect_url: redirectUrl,
            receipt_button_text: 'Back to SoEnglish',
            receipt_link_url: redirectUrl,
          },
          checkout_data: {
            email: email || undefined,
            name: name || undefined,
            custom: customData,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: storeId } },
          variant: { data: { type: 'variants', id: variantId } },
        },
      },
    }),
  });

  const body = (await response.json().catch(() => null)) as LemonCheckoutResponse | null;
  const id = body?.data?.id?.trim();
  const url = body?.data?.attributes?.url?.trim();
  if (!response.ok || !id || !url) {
    const message = body?.errors?.[0]?.detail || body?.errors?.[0]?.title;
    throw new Error(message || 'Lemon Squeezy did not return a checkout URL');
  }
  return { id, url };
}
