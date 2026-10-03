const BASE_URL = 'http://localhost:5001/api';

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  details?: unknown;
}

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = (await res.json()) as ApiResponse;
  if (!res.ok || !json.success) {
    throw new Error(`Login failed: ${json.error ?? res.statusText}`);
  }
  return (json.data as { token: string }).token;
}

async function api(
  path: string,
  token: string,
  query?: Record<string, string>
): Promise<{ status: number; json: ApiResponse }> {
  const url = new URL(`${BASE_URL}${path}`, BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
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

  const token = await login('admin@nexlevr.com', 'NexLevr@2025');
  console.log('Logged in as admin');

  console.log('\n--- Client Growth ---');
  const growth = await api('/analytics/clients/growth', token);
  check('Status 200', growth.status === 200, `got ${growth.status}`);
  check('Success true', growth.json.success === true);
  check('Data is array', Array.isArray(growth.json.data));

  console.log('\n--- Lead Status Distribution ---');
  const status = await api('/analytics/leads/status', token);
  check('Status 200', status.status === 200, `got ${status.status}`);
  check('Success true', status.json.success === true);
  check('Data is array', Array.isArray(status.json.data));

  console.log('\n--- With filters ---');
  const filtered = await api('/analytics/clients/growth', token, {
    dateFrom: '2024-01-01',
    dateTo: '2026-12-31',
  });
  check('Filtered status 200', filtered.status === 200, `got ${filtered.status}`);

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
