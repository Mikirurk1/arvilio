import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getReqRes } from './auth-request.util';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: { create: jest.fn() },
}));

describe('getReqRes', () => {
  it('returns http request/response', () => {
    const req = { user: { id: 'u1' } };
    const res = { cookie: jest.fn() };
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    } as unknown as ExecutionContext;

    expect(getReqRes(context)).toEqual({ req, res });
  });

  it('returns graphql context req/res', () => {
    const req = { user: { id: 'u2' } };
    const res = { clearCookie: jest.fn() };
    (GqlExecutionContext.create as jest.Mock).mockReturnValue({
      getContext: () => ({ req, res }),
    });
    const context = { getType: () => 'graphql' } as unknown as ExecutionContext;

    expect(getReqRes(context)).toEqual({ req, res });
  });
});
