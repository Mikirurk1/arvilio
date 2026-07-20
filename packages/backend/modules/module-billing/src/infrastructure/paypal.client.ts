type PayPalAuthParams = {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
};

type PayPalCreateOrderParams = PayPalAuthParams & {
  amountMinor: number;
  currency: string;
  title: string;
  description: string;
  customId: string;
  returnUrl: string;
  cancelUrl: string;
};

type PayPalVerifyWebhookParams = PayPalAuthParams & {
  webhookId: string;
  headers: {
    authAlgo?: string;
    certUrl?: string;
    transmissionId?: string;
    transmissionSig?: string;
    transmissionTime?: string;
  };
  event: Record<string, unknown>;
};

type PayPalTokenResponse = {
  access_token?: string;
  error_description?: string;
  error?: string;
};

type PayPalLink = {
  href?: string;
  rel?: string;
};

type PayPalOrderResponse = {
  id?: string;
  status?: string;
  links?: PayPalLink[];
  details?: Array<{ description?: string }>;
  message?: string;
};

type PayPalWebhookVerificationResponse = {
  verification_status?: string;
};

function minorToPayPalAmount(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

async function getPayPalAccessToken({
  apiBaseUrl,
  clientId,
  clientSecret,
}: PayPalAuthParams): Promise<string> {
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${apiBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });
  const body = (await response.json().catch(() => null)) as PayPalTokenResponse | null;
  const accessToken = body?.access_token?.trim();
  if (!response.ok || !accessToken) {
    throw new Error(body?.error_description || body?.error || 'PayPal access token request failed');
  }
  return accessToken;
}

function getApprovalUrl(links: PayPalLink[] | undefined): string | undefined {
  return links?.find((link) => link.rel === 'approve' || link.rel === 'payer-action')?.href?.trim();
}

export async function createPayPalOrder({
  apiBaseUrl,
  clientId,
  clientSecret,
  amountMinor,
  currency,
  title,
  description,
  customId,
  returnUrl,
  cancelUrl,
}: PayPalCreateOrderParams): Promise<{ orderId: string; approvalUrl: string }> {
  const accessToken = await getPayPalAccessToken({ apiBaseUrl, clientId, clientSecret });
  const response = await fetch(`${apiBaseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: customId,
          description,
          amount: {
            currency_code: currency,
            value: minorToPayPalAmount(amountMinor),
          },
          items: [
            {
              name: title,
              quantity: '1',
              unit_amount: {
                currency_code: currency,
                value: minorToPayPalAmount(amountMinor),
              },
            },
          ],
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'Arvilio',
            user_action: 'PAY_NOW',
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
    }),
  });

  const body = (await response.json().catch(() => null)) as PayPalOrderResponse | null;
  const orderId = body?.id?.trim();
  const approvalUrl = getApprovalUrl(body?.links);
  if (!response.ok || !orderId || !approvalUrl) {
    throw new Error(body?.details?.[0]?.description || body?.message || 'PayPal did not return an approval URL');
  }
  return { orderId, approvalUrl };
}

export async function capturePayPalOrder({
  apiBaseUrl,
  clientId,
  clientSecret,
  orderId,
}: PayPalAuthParams & { orderId: string }): Promise<Record<string, unknown>> {
  const accessToken = await getPayPalAccessToken({ apiBaseUrl, clientId, clientSecret });
  const response = await fetch(`${apiBaseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !body) {
    throw new Error('PayPal capture failed');
  }
  return body;
}

export async function verifyPayPalWebhookSignature({
  apiBaseUrl,
  clientId,
  clientSecret,
  webhookId,
  headers,
  event,
}: PayPalVerifyWebhookParams): Promise<boolean> {
  const authAlgo = headers.authAlgo?.trim();
  const certUrl = headers.certUrl?.trim();
  const transmissionId = headers.transmissionId?.trim();
  const transmissionSig = headers.transmissionSig?.trim();
  const transmissionTime = headers.transmissionTime?.trim();
  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return false;
  }

  const accessToken = await getPayPalAccessToken({ apiBaseUrl, clientId, clientSecret });
  const response = await fetch(`${apiBaseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });
  const body = (await response.json().catch(() => null)) as PayPalWebhookVerificationResponse | null;
  return response.ok && body?.verification_status === 'SUCCESS';
}
