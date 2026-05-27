import { createHash } from 'crypto';
import { signLiqPay, verifyLiqPaySignature } from '../../src/infrastructure/liqpay.client';

describe('LiqPay signature (integration helpers)', () => {
  it('verifies round-trip signature', () => {
    const privateKey = 'test_private_key';
    const data = Buffer.from(JSON.stringify({ order_id: 'pay-1', status: 'success' })).toString(
      'base64',
    );
    const signature = signLiqPay(data, privateKey);
    expect(verifyLiqPaySignature(data, signature, privateKey)).toBe(true);
    expect(verifyLiqPaySignature(data, signature, 'wrong')).toBe(false);
  });

  it('matches known sha1 base64 pattern', () => {
    const privateKey = 'key';
    const data = 'dGVzdA==';
    const expected = createHash('sha1').update(`${privateKey}${data}${privateKey}`).digest('base64');
    expect(signLiqPay(data, privateKey)).toBe(expected);
  });
});
