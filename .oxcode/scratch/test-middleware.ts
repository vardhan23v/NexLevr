import { Request, Response } from 'express';
import { requireAuth } from '../backend/src/middleware/auth';
import { requireRole } from '../backend/src/middleware/rbac';
import { errorHandler } from '../backend/src/middleware/errorHandler';
import { success, error as errorResponse } from '../backend/src/utils/response';
import { generateToken } from '../backend/src/utils/jwt';
import { UserRole } from '@prisma/client';

function createRes(): Response {
  const res: Partial<Response> = {
    statusCode: 200,
    jsonBody: undefined,
    status(code: number) {
      this.statusCode = code;
      return this as Response;
    },
    json(body: unknown) {
      this.jsonBody = body;
      return this as Response;
    },
  };
  return res as Response;
}

function createReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    ...overrides,
  } as Request;
}

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function test(label: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      console.log(`✓ ${label}`);
    } catch (err) {
      console.error(`✗ ${label}`);
      console.error(err instanceof Error ? err.message : err);
      process.exitCode = 1;
    }
  })();
}

async function main() {
  const validToken = generateToken({
    sub: '11111111-1111-1111-1111-111111111111',
    email: 'test@example.com',
    role: UserRole.MANAGER,
  });

  await test('requireAuth rejects missing Authorization header', () => {
    const req = createReq();
    const res = createRes();
    let called = false;
    requireAuth(req, res, () => {
      called = true;
    });
    assertEqual(res.statusCode, 401, 'status');
    assertEqual((res.jsonBody as Record<string, unknown>)?.success, false, 'success');
    assertEqual(called, false, 'next called');
  });

  await test('requireAuth rejects malformed Authorization header', () => {
    const req = createReq({ headers: { authorization: 'Basic token' } });
    const res = createRes();
    let called = false;
    requireAuth(req, res, () => {
      called = true;
    });
    assertEqual(res.statusCode, 401, 'status');
    assertEqual(called, false, 'next called');
  });

  await test('requireAuth rejects invalid token', () => {
    const req = createReq({ headers: { authorization: 'Bearer invalid-token' } });
    const res = createRes();
    let called = false;
    requireAuth(req, res, () => {
      called = true;
    });
    assertEqual(res.statusCode, 401, 'status');
    assertEqual(called, false, 'next called');
  });

  await test('requireAuth accepts valid token and attaches req.user', () => {
    const req = createReq({ headers: { authorization: `Bearer ${validToken}` } });
    const res = createRes();
    let called = false;
    requireAuth(req, res, () => {
      called = true;
    });
    assertEqual(res.statusCode, 200, 'status');
    assertEqual(called, true, 'next called');
    assertEqual(req.user.id, '11111111-1111-1111-1111-111111111111', 'user.id');
    assertEqual(req.user.email, 'test@example.com', 'user.email');
    assertEqual(req.user.role, UserRole.MANAGER, 'user.role');
  });

  await test('requireRole rejects when req.user is missing', () => {
    const req = createReq();
    const res = createRes();
    let called = false;
    requireRole(UserRole.ADMIN)(req, res, () => {
      called = true;
    });
    assertEqual(res.statusCode, 401, 'status');
    assertEqual(called, false, 'next called');
  });

  await test('requireRole rejects insufficient role', () => {
    const req = createReq();
    req.user = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'test@example.com',
      role: UserRole.TEAM_MEMBER,
    };
    const res = createRes();
    let called = false;
    requireRole(UserRole.ADMIN, UserRole.MANAGER)(req, res, () => {
      called = true;
    });
    assertEqual(res.statusCode, 403, 'status');
    assertEqual((res.jsonBody as Record<string, unknown>)?.success, false, 'success');
    assertEqual(called, false, 'next called');
  });

  await test('requireRole allows authorized role', () => {
    const req = createReq();
    req.user = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'test@example.com',
      role: UserRole.MANAGER,
    };
    const res = createRes();
    let called = false;
    requireRole(UserRole.ADMIN, UserRole.MANAGER)(req, res, () => {
      called = true;
    });
    assertEqual(res.statusCode, 200, 'status');
    assertEqual(called, true, 'next called');
  });

  await test('success helper returns correct shape', () => {
    const res = createRes();
    success(res, { id: 1 }, 'Done');
    assertEqual(res.statusCode, 200, 'status');
    assertEqual(res.jsonBody, { success: true, message: 'Done', data: { id: 1 } }, 'body');
  });

  await test('error helper returns correct shape with custom status', () => {
    const res = createRes();
    errorResponse(res, 'Not found', 404);
    assertEqual(res.statusCode, 404, 'status');
    assertEqual(res.jsonBody, { success: false, message: 'Not found' }, 'body');
  });

  await test('errorHandler returns JSON and hides stack in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = new Error('Something broke');
    (err as Error & { statusCode: number }).statusCode = 400;
    const res = createRes();
    errorHandler(err, createReq(), res, () => {});
    assertEqual(res.statusCode, 400, 'status');
    const body = res.jsonBody as Record<string, unknown>;
    assertEqual(body.success, false, 'success');
    assertEqual(body.message, 'Something broke', 'message');
    assertEqual('stack' in body, false, 'stack hidden');
    process.env.NODE_ENV = originalEnv;
  });

  await test('errorHandler includes stack outside production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const err = new Error('Dev error');
    const res = createRes();
    errorHandler(err, createReq(), res, () => {});
    assertEqual(res.statusCode, 500, 'status');
    const body = res.jsonBody as Record<string, unknown>;
    assertEqual(body.success, false, 'success');
    assertEqual(typeof body.stack, 'string', 'stack present');
    process.env.NODE_ENV = originalEnv;
  });
}

main();
