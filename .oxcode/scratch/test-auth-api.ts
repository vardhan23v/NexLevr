import { createApp } from '../../backend/src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = createApp();

const BASE_URL = 'http://localhost:5001';

async function request(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

async function main() {
  const testEmail = `auth-test-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123!';
  const testName = 'Auth Test User';

  console.log('--- Register ---');
  const registerRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: testName,
      role: 'ADMIN',
    }),
  });
  console.log('Status:', registerRes.status);
  console.log('Body:', JSON.stringify(registerRes.body, null, 2));

  if (registerRes.status !== 201) {
    throw new Error('Register failed');
  }

  console.log('\n--- Login ---');
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  console.log('Status:', loginRes.status);
  console.log('Body:', JSON.stringify(loginRes.body, null, 2));

  if (loginRes.status !== 200) {
    throw new Error('Login failed');
  }

  const token = (loginRes.body as { data: { token: string } }).data.token;

  console.log('\n--- Me ---');
  const meRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Status:', meRes.status);
  console.log('Body:', JSON.stringify(meRes.body, null, 2));

  if (meRes.status !== 200) {
    throw new Error('Get current user failed');
  }

  console.log('\n--- Me without token ---');
  const meNoTokenRes = await request('/api/auth/me');
  console.log('Status:', meNoTokenRes.status);
  console.log('Body:', JSON.stringify(meNoTokenRes.body, null, 2));

  if (meNoTokenRes.status !== 401) {
    throw new Error('Expected 401 for missing token');
  }

  console.log('\n--- Logout ---');
  const logoutRes = await request('/api/auth/logout', { method: 'POST' });
  console.log('Status:', logoutRes.status);
  console.log('Body:', JSON.stringify(logoutRes.body, null, 2));

  if (logoutRes.status !== 200) {
    throw new Error('Logout failed');
  }

  console.log('\n--- Validation error ---');
  const invalidRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email', password: 'short', name: '' }),
  });
  console.log('Status:', invalidRes.status);
  console.log('Body:', JSON.stringify(invalidRes.body, null, 2));

  if (invalidRes.status !== 400) {
    throw new Error('Expected 400 for invalid input');
  }

  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();

  console.log('\nAll auth API checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
