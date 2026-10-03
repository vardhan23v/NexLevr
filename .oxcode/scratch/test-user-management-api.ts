import { PrismaClient } from '@prisma/client';

const BASE_URL = 'http://localhost:5001/api';
const prisma = new PrismaClient();

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
  token: string | null,
  body?: unknown
): Promise<{ status: number; json: ApiResponse }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as ApiResponse;
  return { status: res.status, json };
}

async function login(email: string, password: string): Promise<string | null> {
  const { status, json } = await api('POST', '/auth/login', null, {
    email,
    password,
  });
  if (status !== 200 || !json.data || typeof json.data !== 'object') {
    console.log(`  Login failed for ${email}:`, json);
    return null;
  }
  const data = json.data as { token?: string };
  return data.token ?? null;
}

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    console.log(`  ✗ ${label}${detail ? ` - ${detail}` : ''}`);
    throw new Error(`Check failed: ${label}`);
  }
}

async function main() {
  let passed = 0;
  let failed = 0;

  function tally(label: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  ✓ ${label}`);
      passed++;
    } else {
      console.log(`  ✗ ${label}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  // Clean up any previous test user
  await prisma.user.deleteMany({ where: { email: 'testusermgr@nexlevr.com' } });

  const adminToken = await login('admin@nexlevr.com', 'NexLevr@2025');
  const managerToken = await login('manager@nexlevr.com', 'NexLevr@2025');
  const teamToken = await login('member@nexlevr.com', 'NexLevr@2025');

  tally('Admin login succeeded', !!adminToken);
  tally('Manager login succeeded', !!managerToken);
  tally('Team member login succeeded', !!teamToken);

  if (!adminToken || !managerToken || !teamToken) {
    console.log('Aborting: required tokens missing');
    process.exit(1);
  }

  // GET /api/users as admin
  const getAll = await api('GET', '/users', adminToken);
  tally(
    'GET /users as admin returns 200',
    getAll.status === 200 && getAll.json.success === true
  );
  const users = Array.isArray(getAll.json.data) ? getAll.json.data : [];
  const hasNoPasswordHash = users.every(
    (u: Record<string, unknown>) => !('passwordHash' in u)
  );
  tally('GET /users never exposes passwordHash', hasNoPasswordHash);

  // GET /api/users as non-admin should be 403
  const getAllManager = await api('GET', '/users', managerToken);
  tally(
    'GET /users as manager returns 403',
    getAllManager.status === 403
  );
  const getAllTeam = await api('GET', '/users', teamToken);
  tally(
    'GET /users as team member returns 403',
    getAllTeam.status === 403
  );

  // POST /api/users as admin
  const create = await api('POST', '/users', adminToken, {
    name: 'Test User Manager',
    email: 'testusermgr@nexlevr.com',
    password: 'TestPass123!',
    role: 'TEAM_MEMBER',
  });
  tally(
    'POST /users as admin returns 201',
    create.status === 201 && create.json.success === true
  );
  const createdUser =
    create.json.data && typeof create.json.data === 'object'
      ? (create.json.data as { id: string; email: string; disabled: boolean })
      : null;
  tally('Created user has id and email', !!createdUser?.id && !!createdUser?.email);
  tally(
    'Created user response does not contain passwordHash',
    !create.json.data || !('passwordHash' in (create.json.data as object))
  );

  if (!createdUser) {
    console.log('Aborting: user creation failed');
    process.exit(1);
  }

  // POST /api/users as non-admin should be 403
  const createManager = await api('POST', '/users', managerToken, {
    name: 'Unauthorized',
    email: 'unauthorized@nexlevr.com',
    password: 'TestPass123!',
    role: 'TEAM_MEMBER',
  });
  tally('POST /users as manager returns 403', createManager.status === 403);

  // POST /api/users with duplicate email should be 409
  const createDuplicate = await api('POST', '/users', adminToken, {
    name: 'Duplicate',
    email: 'testusermgr@nexlevr.com',
    password: 'TestPass123!',
    role: 'TEAM_MEMBER',
  });
  tally(
    'POST /users with duplicate email returns 409',
    createDuplicate.status === 409
  );

  // GET /api/users/:id as admin
  const getOne = await api('GET', `/users/${createdUser.id}`, adminToken);
  tally(
    'GET /users/:id as admin returns 200',
    getOne.status === 200 && getOne.json.success === true
  );

  // GET /api/users/:id as non-admin should be 403
  const getOneTeam = await api('GET', `/users/${createdUser.id}`, teamToken);
  tally(
    'GET /users/:id as team member returns 403',
    getOneTeam.status === 403
  );

  // PUT /api/users/:id as admin
  const update = await api('PUT', `/users/${createdUser.id}`, adminToken, {
    name: 'Test User Updated',
    role: 'MANAGER',
  });
  tally(
    'PUT /users/:id as admin returns 200',
    update.status === 200 && update.json.success === true
  );
  const updatedUser =
    update.json.data && typeof update.json.data === 'object'
      ? (update.json.data as { name: string; role: string })
      : null;
  tally(
    'Updated user reflects new name and role',
    updatedUser?.name === 'Test User Updated' && updatedUser?.role === 'MANAGER'
  );

  // PUT /api/users/:id as non-admin should be 403
  const updateTeam = await api('PUT', `/users/${createdUser.id}`, teamToken, {
    name: 'Hacked',
  });
  tally('PUT /users/:id as team member returns 403', updateTeam.status === 403);

  // PUT /api/users/:id with empty body should be 400
  const updateEmpty = await api('PUT', `/users/${createdUser.id}`, adminToken, {});
  tally('PUT /users/:id with empty body returns 400', updateEmpty.status === 400);

  // DELETE /api/users/:id as admin (disable)
  const disable = await api('DELETE', `/users/${createdUser.id}`, adminToken);
  tally(
    'DELETE /users/:id as admin returns 200',
    disable.status === 200 && disable.json.success === true
  );
  const disabledUser =
    disable.json.data && typeof disable.json.data === 'object'
      ? (disable.json.data as { disabled: boolean })
      : null;
  tally('Disabled user has disabled=true', disabledUser?.disabled === true);

  // Disabled user should not be able to login
  const disabledLogin = await login('testusermgr@nexlevr.com', 'TestPass123!');
  tally('Disabled user cannot login', disabledLogin === null);

  // DELETE /api/users/:id as non-admin should be 403
  // Re-enable user first so we can test non-admin disable attempt
  await prisma.user.update({
    where: { id: createdUser.id },
    data: { disabled: false },
  });
  const disableTeam = await api('DELETE', `/users/${createdUser.id}`, teamToken);
  tally(
    'DELETE /users/:id as team member returns 403',
    disableTeam.status === 403
  );

  // Validation: missing required fields
  const createInvalid = await api('POST', '/users', adminToken, {
    email: 'invalid-email',
    password: 'short',
    role: 'INVALID_ROLE',
  });
  tally(
    'POST /users with invalid data returns 400',
    createInvalid.status === 400
  );

  // Cleanup
  await prisma.user.deleteMany({ where: { email: 'testusermgr@nexlevr.com' } });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('Test error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
