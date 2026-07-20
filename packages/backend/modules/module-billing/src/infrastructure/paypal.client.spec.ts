import { createPayPalOrder, verifyPayPalWebhookSignature } from './paypal.client';

describe('paypal client helpers', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('creates an order and returns the approval url', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'paypal-access-token' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'ORDER-123',
          links: [{ rel: 'approve', href: 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER-123' }],
        }),
      } as Response);
    global.fetch = fetchMock as typeof fetch;

    const result = await createPayPalOrder({
      apiBaseUrl: 'https://api-m.sandbox.paypal.com',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      amountMinor: 12500,
      currency: 'USD',
      title: '5 lessons',
      description: '5 lessons for Arvilio balance top-up',
      customId: 'payment-1',
      returnUrl: 'https://arvilio.com/payment?status=success',
      cancelUrl: 'https://arvilio.com/payment?status=cancelled',
    });

    expect(result).toEqual({
      orderId: 'ORDER-123',
      approvalUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER-123',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('verifies PayPal webhook signatures through the verification endpoint', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'paypal-access-token' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ verification_status: 'SUCCESS' }),
      } as Response);
    global.fetch = fetchMock as typeof fetch;

    const verified = await verifyPayPalWebhookSignature({
      apiBaseUrl: 'https://api-m.sandbox.paypal.com',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      webhookId: 'WH-123',
      headers: {
        authAlgo: 'SHA256withRSA',
        certUrl: 'https://api.sandbox.paypal.com/cert.pem',
        transmissionId: 'tx-1',
        transmissionSig: 'sig-1',
        transmissionTime: '2026-05-26T10:00:00Z',
      },
      event: { id: 'evt-1', event_type: 'PAYMENT.CAPTURE.COMPLETED' },
    });

    expect(verified).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
