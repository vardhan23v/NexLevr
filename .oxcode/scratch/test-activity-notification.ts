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

  // Get a team member for assignments
  const teamUser = await prisma.user.findFirst({ where: { role: 'TEAM_MEMBER' } });
  if (!teamUser) {
    console.log('ERROR: Missing seed data (team member)');
    process.exit(1);
  }

  // Track created IDs for cleanup
  const created = {
    clientId: '',
    campaignId: '',
    leadId: '',
    taskId: '',
  };

  // --- CLIENT ---
  console.log('\n--- Client creates activity ---');
  const clientRes = await api('POST', '/clients', adminToken, {
    name: 'Activity Test Client',
    company: 'Activity Test Co',
    email: `activity-test-${Date.now()}@example.com`,
    status: 'ACTIVE',
  });
  check('Create client returns 201', clientRes.status === 201, `got ${clientRes.status}`);
  created.clientId = (clientRes.json.data as { id: string })?.id;
  check('Client has id', !!created.clientId);

  // --- CAMPAIGN ---
  console.log('\n--- Campaign creates activity ---');
  const campaignRes = await api('POST', '/campaigns', adminToken, {
    name: 'Activity Test Campaign',
    clientId: created.clientId,
    type: 'SOCIAL_MEDIA',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 1000,
  });
  check('Create campaign returns 201', campaignRes.status === 201, `got ${campaignRes.status}`);
  created.campaignId = (campaignRes.json.data as { id: string })?.id;
  check('Campaign has id', !!created.campaignId);

  // --- LEAD ---
  console.log('\n--- Lead creates activity and notification ---');
  const leadRes = await api('POST', '/leads', adminToken, {
    name: 'Activity Test Lead',
    email: `lead-${Date.now()}@example.com`,
    source: 'Website',
    campaignId: created.campaignId,
    assignedUserId: teamUser.id,
  });
  check('Create lead returns 201', leadRes.status === 201, `got ${leadRes.status}`);
  created.leadId = (leadRes.json.data as { id: string })?.id;
  check('Lead has id', !!created.leadId);

  // --- TASK ---
  console.log('\n--- Task creates activity and notification ---');
  const taskRes = await api('POST', '/tasks', adminToken, {
    title: 'Activity Test Task',
    assignedUserId: teamUser.id,
    clientId: created.clientId,
    campaignId: created.campaignId,
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  check('Create task returns 201', taskRes.status === 201, `got ${taskRes.status}`);
  created.taskId = (taskRes.json.data as { id: string })?.id;
  check('Task has id', !!created.taskId);

  // --- ACTIVITIES API ---
  console.log('\n--- Activities API ---');
  const activitiesRes = await api('GET', '/activities?limit=20', adminToken);
  check('GET /activities returns 200', activitiesRes.status === 200, `got ${activitiesRes.status}`);
  const activities = (activitiesRes.json.data ?? []) as Array<{ entityType: string; action: string; entityId?: string }>;
  check('Activities is array', Array.isArray(activities));
  check('Has CLIENT activity', activities.some((a) => a.entityType === 'CLIENT' && a.action === 'CREATED'));
  check('Has CAMPAIGN activity', activities.some((a) => a.entityType === 'CAMPAIGN' && a.action === 'CREATED'));
  check('Has LEAD activity', activities.some((a) => a.entityType === 'LEAD' && a.action === 'CREATED'));
  check('Has TASK activity', activities.some((a) => a.entityType === 'TASK' && a.action === 'CREATED'));

  // --- NOTIFICATIONS API ---
  console.log('\n--- Notifications API ---');
  const tmLogin = await api('POST', '/auth/login', null, {
    email: 'member@nexlevr.com',
    password: 'NexLevr@2025',
  });
  check('TM login returns 200', tmLogin.status === 200, `got ${tmLogin.status}`);
  const tmToken = (tmLogin.json.data as { token: string })?.token;
  check('TM token received', !!tmToken);

  const notificationsRes = await api('GET', '/notifications', tmToken);
  check('GET /notifications returns 200', notificationsRes.status === 200, `got ${notificationsRes.status}`);
  const notifications = (notificationsRes.json.data ?? []) as Array<{ id: string; type: string; read: boolean }>;
  check('Notifications is array', Array.isArray(notifications));
  check('Has LEAD_ASSIGNED notification', notifications.some((n) => n.type === 'LEAD_ASSIGNED'));
  check('Has TASK_ASSIGNED notification', notifications.some((n) => n.type === 'TASK_ASSIGNED'));

  const unreadNotification = notifications.find((n) => !n.read);
  check('Has unread notification', !!unreadNotification);

  if (unreadNotification) {
    const markRes = await api('PUT', `/notifications/${unreadNotification.id}/read`, tmToken);
    check('PUT /notifications/:id/read returns 200', markRes.status === 200, `got ${markRes.status}`);

    const marked = (markRes.json.data ?? {}) as { read: boolean };
    check('Notification marked read', marked.read === true);

    const markOtherUserRes = await api('PUT', `/notifications/${unreadNotification.id}/read`, adminToken);
    check('Mark other user notification returns 404', markOtherUserRes.status === 404, `got ${markOtherUserRes.status}`);
  }

  const markAllRes = await api('PUT', '/notifications/read-all', tmToken);
  check('PUT /notifications/read-all returns 200', markAllRes.status === 200, `got ${markAllRes.status}`);

  const afterMarkAll = await api('GET', '/notifications', tmToken);
  const afterNotifications = (afterMarkAll.json.data ?? []) as Array<{ read: boolean }>;
  check('All notifications read', afterNotifications.every((n) => n.read));

  // --- UNAUTHORIZED ---
  console.log('\n--- Unauthorized access ---');
  const noAuthActivities = await api('GET', '/activities', null);
  check('GET /activities without token returns 401', noAuthActivities.status === 401, `got ${noAuthActivities.status}`);
  const noAuthNotifications = await api('GET', '/notifications', null);
  check('GET /notifications without token returns 401', noAuthNotifications.status === 401, `got ${noAuthNotifications.status}`);

  // --- CLEANUP ---
  console.log('\n--- Cleanup ---');
  await api('DELETE', `/tasks/${created.taskId}`, adminToken);
  await api('DELETE', `/leads/${created.leadId}`, adminToken);
  await api('DELETE', `/campaigns/${created.campaignId}`, adminToken);
  await api('DELETE', `/clients/${created.clientId}`, adminToken);
  check('Cleanup completed', true);

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
