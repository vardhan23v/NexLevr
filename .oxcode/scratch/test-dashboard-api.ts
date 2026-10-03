const BASE_URL = 'http://localhost:5001/api';

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
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nexlevr.com', password: 'NexLevr@2025' }),
  });
  const loginJson = (await loginRes.json()) as ApiResponse;
  check('Login returns 200', loginRes.status === 200, `got ${loginRes.status}`);
  const token = (loginJson.data as { token: string })?.token;
  check('Token received', !!token);

  // Dashboard stats
  console.log('\n--- Dashboard Stats ---');
  const dashboard = await api('GET', '/analytics/dashboard', token);
  check('Dashboard returns 200', dashboard.status === 200, `got ${dashboard.status}`);
  check('Dashboard success true', dashboard.json.success === true);
  const stats = dashboard.json.data as {
    totalClients?: number;
    activeCampaigns?: number;
    leadsGenerated?: number;
    tasksPending?: number;
    conversionRate?: number;
  };
  check('Has totalClients', typeof stats.totalClients === 'number');
  check('Has activeCampaigns', typeof stats.activeCampaigns === 'number');
  check('Has leadsGenerated', typeof stats.leadsGenerated === 'number');
  check('Has tasksPending', typeof stats.tasksPending === 'number');
  check('Has conversionRate', typeof stats.conversionRate === 'number');

  // Campaign performance
  console.log('\n--- Campaign Performance ---');
  const campaigns = await api('GET', '/analytics/campaigns', token);
  check('Campaigns returns 200', campaigns.status === 200, `got ${campaigns.status}`);
  check('Campaigns success true', campaigns.json.success === true);
  check('Campaigns data is array', Array.isArray(campaigns.json.data));

  // Lead trends
  console.log('\n--- Lead Trends ---');
  const leads = await api('GET', '/analytics/leads', token);
  check('Leads returns 200', leads.status === 200, `got ${leads.status}`);
  check('Leads success true', leads.json.success === true);
  check('Leads data is array', Array.isArray(leads.json.data));

  // Revenue stats
  console.log('\n--- Revenue Stats ---');
  const revenue = await api('GET', '/analytics/revenue', token);
  check('Revenue returns 200', revenue.status === 200, `got ${revenue.status}`);
  check('Revenue success true', revenue.json.success === true);
  const revenueData = revenue.json.data as {
    totalValue?: number;
    convertedValue?: number;
    averageValue?: number;
  };
  check('Has totalValue', typeof revenueData.totalValue === 'number');

  // Task stats
  console.log('\n--- Task Stats ---');
  const taskStats = await api('GET', '/tasks/stats', token);
  check('Task stats returns 200', taskStats.status === 200, `got ${taskStats.status}`);
  check('Task stats success true', taskStats.json.success === true);
  const taskData = taskStats.json.data as {
    byStatus?: unknown[];
    byPriority?: unknown[];
  };
  check('Has byStatus', Array.isArray(taskData.byStatus));
  check('Has byPriority', Array.isArray(taskData.byPriority));

  // Activities (expected to fail until activity API is implemented)
  console.log('\n--- Activities ---');
  let activitiesStatus = 0;
  try {
    const activitiesRes = await fetch(`${BASE_URL}/activities?limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    activitiesStatus = activitiesRes.status;
  } catch {
    activitiesStatus = 0;
  }
  check(
    'Activities endpoint exists (200) or not implemented (404)',
    activitiesStatus === 200 || activitiesStatus === 404,
    `got ${activitiesStatus}`
  );

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Probe error:', err);
  process.exit(1);
});
