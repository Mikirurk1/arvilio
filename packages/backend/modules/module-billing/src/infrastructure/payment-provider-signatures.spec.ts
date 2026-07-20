import { createHmac, createSign, generateKeyPairSync } from 'crypto';
import { verifyLemonSqueezySignature } from './lemonsqueezy.client';
import { verifyMonoPaySignature } from './monopay.client';
import { verifyPaddleSignature } from './paddle.client';
import {
  buildWayForPayAck,
  normalizeWayForPayDomain,
  verifyWayForPayCallback,
} from './wayforpay.client';

describe('payment provider signature helpers', () => {
  it('verifies WayForPay callbacks and builds callback ack', () => {
    const secret = 'wayforpay_secret';
    const payload = {
      merchantAccount: 'merchant',
      orderReference: 'order-1',
      amount: '10.00',
      currency: 'UAH',
      authCode: '541963',
      cardPan: '41****8217',
      transactionStatus: 'Approved',
      reasonCode: '1100',
    };
    const merchantSignature = createHmac('md5', secret)
      .update(
        [
          payload.merchantAccount,
          payload.orderReference,
          payload.amount,
          payload.currency,
          payload.authCode,
          payload.cardPan,
          payload.transactionStatus,
          payload.reasonCode,
        ].join(';'),
        'utf8',
      )
      .digest('hex');

    expect(verifyWayForPayCallback({ ...payload, merchantSignature }, secret)).toBe(true);
    expect(verifyWayForPayCallback({ ...payload, merchantSignature }, 'wrong')).toBe(false);

    expect(normalizeWayForPayDomain('https://arvilio.com/payment')).toBe('arvilio.com');
    expect(buildWayForPayAck('order-1', secret, 1711111111)).toEqual({
      orderReference: 'order-1',
      status: 'accept',
      time: 1711111111,
      signature: createHmac('md5', secret)
        .update('order-1;accept;1711111111', 'utf8')
        .digest('hex'),
    });
  });

  it('verifies Lemon Squeezy webhook signatures', () => {
    const secret = 'lemon_secret';
    const rawBody = JSON.stringify({ meta: { event_name: 'order_created' } });
    const signature = createHmac('sha256', secret).update(rawBody).digest('hex');

    expect(verifyLemonSqueezySignature(rawBody, signature, secret)).toBe(true);
    expect(verifyLemonSqueezySignature(rawBody, signature, 'wrong')).toBe(false);
  });

  it('verifies Paddle webhook signatures', () => {
    const secret = 'paddle_secret';
    const rawBody = JSON.stringify({ event_type: 'transaction.completed' });
    const ts = '1711111111';
    const hash = createHmac('sha256', secret).update(`${ts}:${rawBody}`).digest('hex');

    expect(verifyPaddleSignature(rawBody, `ts=${ts};h1=${hash}`, secret)).toBe(true);
    expect(verifyPaddleSignature(rawBody, `ts=${ts};h1=${hash}`, 'wrong')).toBe(false);
  });

  it('verifies MonoPay webhook signatures', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const rawBody = Buffer.from(JSON.stringify({ invoiceId: 'mono-1', status: 'success' }));
    const signer = createSign('sha256');
    signer.update(rawBody);
    signer.end();
    const signature = signer.sign(privateKey).toString('base64');
    const publicKeyBase64 = Buffer.from(publicKey).toString('base64');

    expect(verifyMonoPaySignature(rawBody, signature, publicKeyBase64)).toBe(true);
    expect(verifyMonoPaySignature(rawBody, signature, Buffer.from('wrong').toString('base64'))).toBe(
      false,
    );
  });
});
