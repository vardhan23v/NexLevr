import { PrismaClient } from '@prisma/client';

const BASE_URL = 'http://localhost:5001/api';
const prisma = new PrismaClient();

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  pagination?: unknown;
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

async function main() {
  let passed = 0;
  let failed = 0;

  function check(label: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  ✓ ${label}`);
      passed++;
    } else {
      console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
      failed++;
    }
  }

  // Get admin token
  console.log('\n--- Auth: Login as admin ---');
  const login = await api('POST', '/auth/login', null, {
    email: 'admin@nexlevr.com',
    password: 'NexLevr@2025',
  });
  check('Login returns 200', login.status === 200, `got ${login.status}`);
  const adminToken = (login.json.data as { token: string })?.token;
  check('Token received', !!adminToken);

  // Get team member token
  console.log('\n--- Auth: Login as team member ---');
  const tmLogin = await api('POST', '/auth/login', null, {
    email: 'member@nexlevr.com',
    password: 'NexLevr@2025',
  });
  check('TM login returns 200', tmLogin.status === 200, `got ${tmLogin.status}`);
  const tmToken = (tmLogin.json.data as { token: string })?.token;
  check('TM token received', !!tmToken);

  // Get a real user ID and client ID from the database for creating tasks
  const teamUser = await prisma.user.findFirst({ where: { role: 'TEAM_MEMBER' } });
  const client = await prisma.client.findFirst();
  const campaign = await prisma.campaign.findFirst();

  if (!teamUser || !client || !campaign) {
    console.log('ERROR: Missing seed data (user, client, or campaign)');
    process.exit(1);
  }

  console.log(`\nUsing: userId=${teamUser.id}, clientId=${client.id}, campaignId=${campaign.id}`);

  // --- UNAUTHORIZED ---
  console.log('\n--- Unauthorized access ---');
  const noAuth = await api('GET', '/tasks', null);
  check('GET /tasks without token returns 401', noAuth.status === 401, `got ${noAuth.status}`);

  // --- CREATE TASK ---
  console.log('\n--- Create Task ---');
  const createBody = {
    title: 'Test Task - API Probe',
    description: 'Testing the task management API',
    assignedUserId: teamUser.id,
    clientId: client.id,
    campaignId: campaign.id,
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'TODO',
  };

  const create = await api('POST', '/tasks', adminToken, createBody);
  check('Create returns 201', create.status === 201, `got ${create.status}`);
  check('Create success true', create.json.success === true);
  const taskId = (create.json.data as { id: string })?.id;
  check('Task has id', !!taskId);
  check('Task title matches', (create.json.data as { title: string })?.title === 'Test Task - API Probe');
  check('Task has assignedUser', !!(create.json.data as { assignedUser?: unknown })?.assignedUser);
  check('Task has client', !!(create.json.data as { client?: unknown })?.client);
  check('Task has campaign', !!(create.json.data as { campaign?: unknown })?.campaign);

  // --- VALIDATION ERROR ---
  console.log('\n--- Validation ---');
  const badCreate = await api('POST', '/tasks', adminToken, { title: '' });
  check('Empty title returns 400', badCreate.status === 400, `got ${badCreate.status}`);
  check('Validation details present', !!badCreate.json.details);

  // --- GET ALL TASKS ---
  console.log('\n--- Get All Tasks ---');
  const getAll = await api('GET', '/tasks', adminToken);
  check('GET /tasks returns 200', getAll.status === 200, `got ${getAll.status}`);
  check('Has data array', Array.isArray(getAll.json.data));
  check('Has pagination', !!getAll.json.pagination);

  // --- GET TASK BY ID ---
  console.log('\n--- Get Task By ID ---');
  const getById = await api('GET', `/tasks/${taskId}`, adminToken);
  check('GET /tasks/:id returns 200', getById.status === 200, `got ${getById.status}`);
  check('Correct task', (getById.json.data as { id: string })?.id === taskId);

  // --- GET MY TASKS ---
  console.log('\n--- Get My Tasks ---');
  const myTasks = await api('GET', '/tasks/my', tmToken);
  check('GET /tasks/my returns 200', myTasks.status === 200, `got ${myTasks.status}`);
  check('Has data array', Array.isArray(myTasks.json.data));

  // --- UPDATE TASK ---
  console.log('\n--- Update Task ---');
  const update = await api('PUT', `/tasks/${taskId}`, adminToken, {
    title: 'Updated Task Title',
    priority: 'URGENT',
  });
  check('Update returns 200', update.status === 200, `got ${update.status}`);
  check('Title updated', (update.json.data as { title: string })?.title === 'Updated Task Title');
  check('Priority updated', (update.json.data as { priority: string })?.priority === 'URGENT');

  // --- UPDATE TASK STATUS ---
  console.log('\n--- Update Task Status ---');
  const statusUpdate = await api('PATCH', `/tasks/${taskId}/status`, adminToken, {
    status: 'IN_PROGRESS',
  });
  check('Status update returns 200', statusUpdate.status === 200, `got ${statusUpdate.status}`);
  check('Status changed', (statusUpdate.json.data as { status: string })?.status === 'IN_PROGRESS');

  // --- TASK STATS ---
  console.log('\n--- Task Stats ---');
  const stats = await api('GET', '/tasks/stats', adminToken);
  check('Stats returns 200', stats.status === 200, `got ${stats.status}`);
  check('Has byStatus', !!(stats.json.data as { byStatus?: unknown })?.byStatus);
  check('Has byPriority', !!(stats.json.data as { byPriority?: unknown })?.byPriority);

  // --- RBAC: Team member cannot create ---
  console.log('\n--- RBAC ---');
  const tmCreate = await api('POST', '/tasks', tmToken, {
    title: 'Should fail',
    assignedUserId: teamUser.id,
    dueDate: new Date().toISOString(),
  });
  check('Team member create returns 403', tmCreate.status === 403, `got ${tmCreate.status}`);

  // --- DELETE TASK ---
  console.log('\n--- Delete Task ---');
  const del = await api('DELETE', `/tasks/${taskId}`, adminToken);
  check('Delete returns 200', del.status === 200, `got ${del.status}`);

  // --- VERIFY DELETION ---
  const afterDel = await api('GET', `/tasks/${taskId}`, adminToken);
  check('Deleted task returns 404', afterDel.status === 404, `got ${afterDel.status}`);

  // --- VERIFY NOTIFICATIONS WERE CREATED ---
  console.log('\n--- Notifications ---');
  const notifications = await prisma.notification.findMany({
    where: { type: { in: ['TASK_ASSIGNED', 'TASK_STATUS_CHANGED'] } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  check('Task notifications exist', notifications.length > 0, `found ${notifications.length}`);

  // --- VERIFY ACTIVITIES WERE LOGGED ---
  console.log('\n--- Activities ---');
  const activities = await prisma.activity.findMany({
    where: { entityType: 'TASK' },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  check('Task activities exist', activities.length > 0, `found ${activities.length}`);

  // --- SEARCH / FILTER ---
  console.log('\n--- Search / Filter ---');
  const searchRes = await api('GET', '/tasks?search=test', adminToken);
  check('Search returns 200', searchRes.status === 200, `got ${searchRes.status}`);

  const filterRes = await api('GET', '/tasks?status=TODO&priority=HIGH', adminToken);
  check('Filter returns 200', filterRes.status === 200, `got ${filterRes.status}`);

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);

  if (failed > 0) process.exit(1);
}

main()
  .catch((err) => {
    console.error('Probe error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });