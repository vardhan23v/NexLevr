import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5001/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  details?: unknown;
}

async function api(
  method: string,
  path: string,
  token: string | null = null,
  body?: unknown,
  headers: Record<string, string> = {}
): Promise<{ status: number; headers: Headers; json: ApiResponse }> {
  const defaultHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { ...defaultHeaders, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as ApiResponse;
  return { status: res.status, headers: res.headers, json };
}

function createTestToken(role = 'ADMIN'): string {
  return jwt.sign(
    { sub: '00000000-0000-0000-0000-000000000001', email: 'test@nexlevr.com', role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    console.log(`  ✗ ${label}${detail ? ` - ${detail}` : ''}`);
    process.exitCode = 1;
  }
}

async function main() {
  console.log('Security hardening verification\n');

  // 1. CORS headers
  console.log('1. CORS headers');
  const corsRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:3000',
      'Access-Control-Request-Method': 'POST',
    },
  });
  check(
    'Access-Control-Allow-Origin is present and matches frontend',
    corsRes.headers.get('access-control-allow-origin') === 'http://localhost:3000',
    `got: ${corsRes.headers.get('access-control-allow-origin')}`
  );

  // 2. Query parameter validation (run before rate limit tests)
  console.log('\n2. Query parameter validation');
  const adminToken = createTestToken('ADMIN');
  const invalidClientStatus = await api('GET', '/clients?status=INVALID_STATUS', adminToken);
  check(
    'Invalid client status query returns 400',
    invalidClientStatus.status === 400 && invalidClientStatus.json.error === 'Validation failed',
    `status: ${invalidClientStatus.status}, error: ${invalidClientStatus.json.error}`
  );

  const invalidCampaignClientId = await api(
    'GET',
    '/campaigns?clientId=not-a-uuid',
    adminToken
  );
  check(
    'Invalid campaign clientId query returns 400',
    invalidCampaignClientId.status === 400 && invalidCampaignClientId.json.error === 'Validation failed',
    `status: ${invalidCampaignClientId.status}, error: ${invalidCampaignClientId.json.error}`
  );

  const invalidLeadPage = await api('GET', '/leads?page=-1', adminToken);
  check(
    'Invalid lead page query returns 400',
    invalidLeadPage.status === 400 && invalidLeadPage.json.error === 'Validation failed',
    `status: ${invalidLeadPage.status}, error: ${invalidLeadPage.json.error}`
  );

  const invalidTaskLimit = await api('GET', '/tasks?limit=999', adminToken);
  check(
    'Invalid task limit query returns 400',
    invalidTaskLimit.status === 400 && invalidTaskLimit.json.error === 'Validation failed',
    `status: ${invalidTaskLimit.status}, error: ${invalidTaskLimit.json.error}`
  );

  const invalidNotificationId = await api('PUT', '/notifications/not-a-uuid/read', adminToken);
  check(
    'Invalid notification id param returns 400',
    invalidNotificationId.status === 400 && invalidNotificationId.json.error === 'Validation failed',
    `status: ${invalidNotificationId.status}, error: ${invalidNotificationId.json.error}`
  );

  // 3. Auth rate limiting
  console.log('\n3. Auth rate limiting');
  let hitAuthLimit = false;
  for (let i = 0; i < 12; i++) {
    const { status } = await api('POST', '/auth/login', null, {
      email: 'notfound@nexlevr.com',
      password: 'wrong',
    });
    if (status === 429) {
      hitAuthLimit = true;
      break;
    }
  }
  check('Auth route returns 429 after repeated attempts', hitAuthLimit);

  // 4. General API rate limiting
  console.log('\n4. General API rate limiting');
  let hitGeneralLimit = false;
  for (let i = 0; i < 205; i++) {
    const { status } = await api('GET', '/clients', adminToken);
    if (status === 429) {
      hitGeneralLimit = true;
      break;
    }
  }
  check('General API returns 429 after many requests', hitGeneralLimit);

  // 5. passwordHash never exposed
  console.log('\n5. passwordHash exposure audit');
  const endpoints = [
    { method: 'GET', path: '/users', token: adminToken },
    { method: 'GET', path: '/auth/me', token: adminToken },
  ];
  let responseText = '';
  for (const endpoint of endpoints) {
    const res = await fetch(`${BASE_URL}${endpoint.path}`, {
      method: endpoint.method,
      headers: { Authorization: `Bearer ${endpoint.token}` },
    });
    responseText += await res.text();
  }
  check('No passwordHash in user/auth responses', !responseText.includes('passwordHash'));

  // 6. helmet security headers
  console.log('\n6. Security headers');
  const rootRes = await fetch('http://localhost:5001/');
  check(
    'X-Content-Type-Options header is nosniff',
    rootRes.headers.get('x-content-type-options') === 'nosniff'
  );
  check(
    'X-Frame-Options header is present',
    rootRes.headers.has('x-frame-options') || rootRes.headers.has('content-security-policy')
  );

  console.log('\nVerification complete.');
}

main()
  .catch((error) => {
    console.error('Verification error:', error);
    process.exit(1);
  });
