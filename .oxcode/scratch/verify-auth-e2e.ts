const BASE_URL = 'http://localhost:5001';

interface ApiResponse {
  status: number;
  body: unknown;
}

async function request(path: string, options: RequestInit = {}): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function main(): Promise<void> {
  console.log('=== Authentication E2E Verification ===\n');

  // 1. Register with validation errors
  console.log('1. POST /api/auth/register with validation errors');
  const invalidRegister = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: 'not-an-email',
      password: '123',
      name: '',
    }),
  });
  console.log('   Status:', invalidRegister.status);
  console.log('   Body:', JSON.stringify(invalidRegister.body, null, 2));
  assert(invalidRegister.status === 400, 'Expected 400 for invalid register payload');
  assert(
    typeof invalidRegister.body === 'object' &&
      invalidRegister.body !== null &&
      'success' in invalidRegister.body &&
      invalidRegister.body.success === false,
    'Expected success: false in error response'
  );
  assert(
    typeof invalidRegister.body === 'object' &&
      invalidRegister.body !== null &&
      'details' in invalidRegister.body &&
      Array.isArray(invalidRegister.body.details) &&
      invalidRegister.body.details.length > 0,
    'Expected field-level validation details'
  );
  console.log('   ✅ Validation errors returned correctly\n');

  // 2. Login with seeded credentials
  console.log('2. POST /api/auth/login with seeded admin credentials');
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@nexlevr.com',
      password: 'NexLevr@2025',
    }),
  });
  console.log('   Status:', loginRes.status);
  console.log('   Body:', JSON.stringify(loginRes.body, null, 2));
  assert(loginRes.status === 200, 'Expected 200 for valid login');
  assert(
    typeof loginRes.body === 'object' &&
      loginRes.body !== null &&
      'success' in loginRes.body &&
      loginRes.body.success === true,
    'Expected success: true in login response'
  );
  assert(
    typeof loginRes.body === 'object' &&
      loginRes.body !== null &&
      'data' in loginRes.body &&
      typeof loginRes.body.data === 'object' &&
      loginRes.body.data !== null &&
      'token' in loginRes.body.data &&
      typeof loginRes.body.data.token === 'string' &&
      loginRes.body.data.token.length > 0,
    'Expected token in login response'
  );
  assert(
    typeof loginRes.body === 'object' &&
      loginRes.body !== null &&
      'data' in loginRes.body &&
      typeof loginRes.body.data === 'object' &&
      loginRes.body.data !== null &&
      'user' in loginRes.body.data &&
      typeof loginRes.body.data.user === 'object' &&
      loginRes.body.data.user !== null &&
      'email' in loginRes.body.data.user &&
      loginRes.body.data.user.email === 'admin@nexlevr.com',
    'Expected user with admin email in login response'
  );
  const token = (loginRes.body as { data: { token: string } }).data.token;
  console.log('   ✅ Login successful, token received\n');

  // 3. Get current user with valid token
  console.log('3. GET /api/auth/me with valid token');
  const meRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('   Status:', meRes.status);
  console.log('   Body:', JSON.stringify(meRes.body, null, 2));
  assert(meRes.status === 200, 'Expected 200 for authenticated /me request');
  assert(
    typeof meRes.body === 'object' &&
      meRes.body !== null &&
      'success' in meRes.body &&
      meRes.body.success === true,
    'Expected success: true in /me response'
  );
  assert(
    typeof meRes.body === 'object' &&
      meRes.body !== null &&
      'data' in meRes.body &&
      typeof meRes.body.data === 'object' &&
      meRes.body.data !== null &&
      'user' in meRes.body.data &&
      typeof meRes.body.data.user === 'object' &&
      meRes.body.data.user !== null &&
      'id' in meRes.body.data.user &&
      'email' in meRes.body.data.user &&
      'role' in meRes.body.data.user,
    'Expected user object with id, email, and role'
  );
  assert(
    !(typeof meRes.body === 'object' &&
      meRes.body !== null &&
      'data' in meRes.body &&
      typeof meRes.body.data === 'object' &&
      meRes.body.data !== null &&
      'user' in meRes.body.data &&
      typeof meRes.body.data.user === 'object' &&
      meRes.body.data.user !== null &&
      'passwordHash' in meRes.body.data.user),
    'Password hash must not be exposed in /me response'
  );
  console.log('   ✅ Current user fetched successfully and password hash not exposed\n');

  // 4. Get current user without token
  console.log('4. GET /api/auth/me without token');
  const meNoTokenRes = await request('/api/auth/me');
  console.log('   Status:', meNoTokenRes.status);
  console.log('   Body:', JSON.stringify(meNoTokenRes.body, null, 2));
  assert(meNoTokenRes.status === 401, 'Expected 401 for unauthenticated /me request');
  assert(
    typeof meNoTokenRes.body === 'object' &&
      meNoTokenRes.body !== null &&
      'success' in meNoTokenRes.body &&
      meNoTokenRes.body.success === false,
    'Expected success: false in 401 response'
  );
  console.log('   ✅ Unauthorized response returned correctly\n');

  // 5. Login with wrong password
  console.log('5. POST /api/auth/login with wrong password');
  const wrongPasswordRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@nexlevr.com',
      password: 'WrongPassword123!',
    }),
  });
  console.log('   Status:', wrongPasswordRes.status);
  console.log('   Body:', JSON.stringify(wrongPasswordRes.body, null, 2));
  assert(wrongPasswordRes.status === 401, 'Expected 401 for wrong password');
  console.log('   ✅ Invalid credentials rejected\n');

  console.log('=== All authentication E2E checks passed ===');
}

main().catch((error) => {
  console.error('\n❌ Authentication E2E verification failed:', error.message);
  process.exit(1);
});
