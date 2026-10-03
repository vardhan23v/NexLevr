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
  query?: Record<string, string>
): Promise<{ status: number; json: ApiResponse }> {
  const url = new URL(`${BASE_URL}${path}`, BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { method, headers });
  const json = (await res.json()) as ApiResponse;
  return { status: res.status, json };
}

async function login(email: string, password: string): Promise<string> {
  const res = await api('POST', '/auth/login', null, undefined);
  // We need body, so use fetch directly
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginJson = (await loginRes.json()) as ApiResponse;
  return (loginJson.data as { token: string })?.token;
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

  const adminToken = await login('admin@nexlevr.com', 'NexLevr@2025');
  check('Admin login succeeded', !!adminToken);

  const tmToken = await login('member@nexlevr.com', 'NexLevr@2025');
  check('Team member login succeeded', !!tmToken);

  // Unauthorized
  console.log('\n--- Unauthorized access ---');
  const noAuth = await api('GET', '/analytics/dashboard', null);
  check('GET /analytics/dashboard without token returns 401', noAuth.status === 401, `got ${noAuth.status}`);

  // Dashboard
  console.log('\n--- Dashboard stats ---');
  const dashboard = await api('GET', '/analytics/dashboard', adminToken);
  check('Dashboard returns 200', dashboard.status === 200, `got ${dashboard.status}`);
  check('Dashboard success true', dashboard.json.success === true);
  const dashData = dashboard.json.data as {
    totalClients?: number;
    activeCampaigns?: number;
    leadsGenerated?: number;
    tasksPending?: number;
    conversionRate?: number;
  };
  check('Dashboard has totalClients', typeof dashData.totalClients === 'number');
  check('Dashboard has activeCampaigns', typeof dashData.activeCampaigns === 'number');
  check('Dashboard has leadsGenerated', typeof dashData.leadsGenerated === 'number');
  check('Dashboard has tasksPending', typeof dashData.tasksPending === 'number');
  check('Dashboard has conversionRate', typeof dashData.conversionRate === 'number');

  // Campaign performance
  console.log('\n--- Campaign performance ---');
  const campaigns = await api('GET', '/analytics/campaigns', adminToken);
  check('Campaigns returns 200', campaigns.status === 200, `got ${campaigns.status}`);
  check('Campaigns success true', campaigns.json.success === true);
  const campData = campaigns.json.data as Array<{
    id?: string;
    name?: string;
    clientName?: string;
    budget?: number;
    leadsCount?: number;
    totalLeadsValue?: number;
    conversionRate?: number;
    status?: string;
  }>;
  check('Campaigns data is array', Array.isArray(campData));
  if (campData.length > 0) {
    check('Campaign has id', typeof campData[0].id === 'string');
    check('Campaign has name', typeof campData[0].name === 'string');
    check('Campaign has budget', typeof campData[0].budget === 'number');
    check('Campaign has leadsCount', typeof campData[0].leadsCount === 'number');
  }

  // Lead trends
  console.log('\n--- Lead trends ---');
  const trends = await api('GET', '/analytics/leads', adminToken);
  check('Lead trends returns 200', trends.status === 200, `got ${trends.status}`);
  check('Lead trends success true', trends.json.success === true);
  const trendData = trends.json.data as Array<{
    month?: string;
    leads?: number;
    converted?: number;
    conversionRate?: number;
  }>;
  check('Trends data is array', Array.isArray(trendData));
  if (trendData.length > 0) {
    check('Trend has month', typeof trendData[0].month === 'string');
    check('Trend has leads', typeof trendData[0].leads === 'number');
    check('Trend has converted', typeof trendData[0].converted === 'number');
    check('Trend has conversionRate', typeof trendData[0].conversionRate === 'number');
  }

  // Revenue
  console.log('\n--- Revenue stats ---');
  const revenue = await api('GET', '/analytics/revenue', adminToken);
  check('Revenue returns 200', revenue.status === 200, `got ${revenue.status}`);
  check('Revenue success true', revenue.json.success === true);
  const revData = revenue.json.data as {
    totalValue?: number;
    convertedValue?: number;
    averageValue?: number;
  };
  check('Revenue has totalValue', typeof revData.totalValue === 'number');
  check('Revenue has convertedValue', typeof revData.convertedValue === 'number');
  check('Revenue has averageValue', typeof revData.averageValue === 'number');

  // Filters
  console.log('\n--- Filters ---');
  const dateFrom = '2025-01-01';
  const dateTo = '2025-12-31';
  const filteredDashboard = await api('GET', '/analytics/dashboard', adminToken, {
    dateFrom,
    dateTo,
  });
  check('Dashboard with date filters returns 200', filteredDashboard.status === 200, `got ${filteredDashboard.status}`);

  const invalidDate = await api('GET', '/analytics/dashboard', adminToken, {
    dateFrom: 'not-a-date',
  });
  check('Invalid date filter returns 400', invalidDate.status === 400, `got ${invalidDate.status}`);

  // RBAC
  console.log('\n--- RBAC ---');
  const tmDashboard = await api('GET', '/analytics/dashboard', tmToken);
  check('Team member analytics returns 403', tmDashboard.status === 403, `got ${tmDashboard.status}`);

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Probe error:', err);
  process.exit(1);
});
