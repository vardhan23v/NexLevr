const BASE_URL = 'http://localhost:5001/api';

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  pagination?: unknown;
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

  // Login as admin
  console.log('\n--- Auth: Login as admin ---');
  const login = await api('POST', '/auth/login', null, {
    email: 'admin@nexlevr.com',
    password: 'NexLevr@2025',
  });
  check('Login returns 200', login.status === 200, `got ${login.status}`);
  const adminToken = (login.json.data as { token: string })?.token;
  check('Token received', !!adminToken);

  // Test users endpoint
  console.log('\n--- Users endpoint ---');
  const usersRes = await api('GET', '/users', adminToken);
  check('GET /users returns 200', usersRes.status === 200, `got ${usersRes.status}`);
  const users = (usersRes.json.data as { id: string; name: string }[]) ?? [];
  check('Users array returned', Array.isArray(users) && users.length > 0, `found ${users.length}`);

  // Get a real user, client, campaign
  const assignedUser = users.find((u) => u.name.toLowerCase().includes('member')) ?? users[0];

  const clientsRes = await api('GET', '/clients', adminToken);
  const clients = (clientsRes.json.data as { id: string; name: string }[]) ?? [];
  const client = clients[0];

  const campaignsRes = await api('GET', '/campaigns', adminToken);
  const campaigns = (campaignsRes.json.data as { id: string; name: string }[]) ?? [];
  const campaign = campaigns[0];

  if (!assignedUser || !client || !campaign) {
    console.log('ERROR: Missing seed data');
    process.exit(1);
  }

  console.log(`\nUsing: userId=${assignedUser.id}, clientId=${client.id}, campaignId=${campaign.id}`);

  // Create task
  console.log('\n--- Create Task via API ---');
  const createBody = {
    title: 'Frontend Task Test',
    description: 'Testing task creation from frontend',
    assignedUserId: assignedUser.id,
    clientId: client.id,
    campaignId: campaign.id,
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'TODO',
  };

  const create = await api('POST', '/tasks', adminToken, createBody);
  check('Create returns 201', create.status === 201, `got ${create.status}`);
  const taskId = (create.json.data as { id: string })?.id;
  check('Task has id', !!taskId);
  check('Task has assignedUser', !!(create.json.data as { assignedUser?: unknown })?.assignedUser);
  check('Task has client', !!(create.json.data as { client?: unknown })?.client);
  check('Task has campaign', !!(create.json.data as { campaign?: unknown })?.campaign);

  // Update status
  console.log('\n--- Update Task Status ---');
  const statusUpdate = await api('PATCH', `/tasks/${taskId}/status`, adminToken, {
    status: 'IN_PROGRESS',
  });
  check('Status update returns 200', statusUpdate.status === 200, `got ${statusUpdate.status}`);
  check('Status changed', (statusUpdate.json.data as { status: string })?.status === 'IN_PROGRESS');

  // Update task
  console.log('\n--- Update Task ---');
  const update = await api('PUT', `/tasks/${taskId}`, adminToken, {
    title: 'Updated Frontend Task',
    priority: 'URGENT',
  });
  check('Update returns 200', update.status === 200, `got ${update.status}`);

  // Delete task
  console.log('\n--- Delete Task ---');
  const del = await api('DELETE', `/tasks/${taskId}`, adminToken);
  check('Delete returns 200', del.status === 200, `got ${del.status}`);

  const afterDel = await api('GET', `/tasks/${taskId}`, adminToken);
  check('Deleted task returns 404', afterDel.status === 404, `got ${afterDel.status}`);

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Probe error:', err);
  process.exit(1);
});
