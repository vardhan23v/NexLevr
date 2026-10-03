import axios, { AxiosError } from 'axios';

const BASE_URL = 'http://localhost:5001/api';

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];

function record(name: string, passed: boolean, detail: string) {
  results.push({ name, passed, detail });
  const icon = passed ? '✓' : '✗';
  console.log(`${icon} ${name}: ${detail}`);
}

async function loginAs(role: 'ADMIN' | 'MANAGER' | 'TEAM_MEMBER'): Promise<string> {
  const emails: Record<string, string> = {
    ADMIN: 'admin@nexlevr.com',
    MANAGER: 'manager@nexlevr.com',
    TEAM_MEMBER: 'member@nexlevr.com',
  };
  const res = await axios.post(`${BASE_URL}/auth/login`, {
    email: emails[role],
    password: 'NexLevr@2025',
  });
  return res.data.data.token;
}

async function main() {
  let adminToken: string;
  let managerToken: string;
  let teamToken: string;
  let createdCampaignId: string;
  let clientId: string;

  // --- Setup: get tokens ---
  try {
    adminToken = await loginAs('ADMIN');
    record('Login as ADMIN', true, 'Got token');
  } catch (e: any) {
    record('Login as ADMIN', false, e.message);
    process.exit(1);
  }

  try {
    managerToken = await loginAs('MANAGER');
    record('Login as MANAGER', true, 'Got token');
  } catch (e: any) {
    record('Login as MANAGER', false, e.message);
    process.exit(1);
  }

  try {
    teamToken = await loginAs('TEAM_MEMBER');
    record('Login as TEAM_MEMBER', true, 'Got token');
  } catch (e: any) {
    record('Login as TEAM_MEMBER', false, e.message);
    process.exit(1);
  }

  // --- Get a client ID for creating campaigns ---
  try {
    const res = await axios.get(`${BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    clientId = res.data.data[0]?.id;
    if (!clientId) throw new Error('No clients found');
    record('Get client for campaign', true, `Client ID: ${clientId}`);
  } catch (e: any) {
    record('Get client for campaign', false, e.message);
    process.exit(1);
  }

  // --- 1. Unauthenticated access ---
  try {
    await axios.get(`${BASE_URL}/campaigns`);
    record('Unauthenticated GET', false, 'Should have returned 401');
  } catch (e: any) {
    const status = e.response?.status;
    record('Unauthenticated GET', status === 401, `Status: ${status}`);
  }

  // --- 2. TEAM_MEMBER cannot create ---
  try {
    await axios.post(
      `${BASE_URL}/campaigns`,
      { name: 'Test', clientId, type: 'SOCIAL_MEDIA', startDate: '2026-01-01', endDate: '2026-06-01', budget: '1000' },
      { headers: { Authorization: `Bearer ${teamToken}` } }
    );
    record('TEAM_MEMBER POST forbidden', false, 'Should have returned 403');
  } catch (e: any) {
    const status = e.response?.status;
    record('TEAM_MEMBER POST forbidden', status === 403, `Status: ${status}`);
  }

  // --- 3. ADMIN creates campaign ---
  try {
    const res = await axios.post(
      `${BASE_URL}/campaigns`,
      {
        name: 'Test Campaign Q1',
        clientId,
        description: 'A test campaign for Q1 marketing',
        type: 'SOCIAL_MEDIA',
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        budget: '5000.00',
        status: 'DRAFT',
        targetAudience: 'Small business owners',
        goals: 'Increase brand awareness by 30%',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    createdCampaignId = res.data.data.id;
    record('ADMIN create campaign', res.status === 201, `ID: ${createdCampaignId}, Name: ${res.data.data.name}`);
  } catch (e: any) {
    record('ADMIN create campaign', false, e.response?.data?.error || e.message);
    process.exit(1);
  }

  // --- 4. Validation: missing required fields ---
  try {
    await axios.post(
      `${BASE_URL}/campaigns`,
      { name: '' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    record('Validation: empty name', false, 'Should have returned 400');
  } catch (e: any) {
    const status = e.response?.status;
    record('Validation: empty name', status === 400, `Status: ${status}, Details: ${JSON.stringify(e.response?.data?.details?.slice(0, 2))}`);
  }

  // --- 5. Validation: endDate before startDate ---
  try {
    await axios.post(
      `${BASE_URL}/campaigns`,
      {
        name: 'Bad Dates',
        clientId,
        type: 'SEO',
        startDate: '2026-12-01',
        endDate: '2026-01-01',
        budget: '1000',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    record('Validation: endDate < startDate', false, 'Should have returned 400');
  } catch (e: any) {
    const status = e.response?.status;
    record('Validation: endDate < startDate', status === 400, `Status: ${status}`);
  }

  // --- 6. Validation: invalid clientId ---
  try {
    await axios.post(
      `${BASE_URL}/campaigns`,
      {
        name: 'Bad Client',
        clientId: '00000000-0000-0000-0000-000000000000',
        type: 'EMAIL_MARKETING',
        startDate: '2026-01-01',
        endDate: '2026-06-01',
        budget: '1000',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    record('Validation: nonexistent client', false, 'Should have returned 404');
  } catch (e: any) {
    const status = e.response?.status;
    record('Validation: nonexistent client', status === 404, `Status: ${status}`);
  }

  // --- 7. GET all campaigns ---
  try {
    const res = await axios.get(`${BASE_URL}/campaigns`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('GET all campaigns', res.status === 200, `Count: ${res.data.data.length}, Pagination: ${JSON.stringify(res.data.pagination)}`);
  } catch (e: any) {
    record('GET all campaigns', false, e.message);
  }

  // --- 8. GET campaign by ID ---
  try {
    const res = await axios.get(`${BASE_URL}/campaigns/${createdCampaignId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('GET campaign by ID', res.status === 200 && res.data.data.name === 'Test Campaign Q1', `Name: ${res.data.data.name}`);
  } catch (e: any) {
    record('GET campaign by ID', false, e.message);
  }

  // --- 9. GET nonexistent campaign ---
  try {
    await axios.get(`${BASE_URL}/campaigns/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('GET nonexistent campaign', false, 'Should have returned 404');
  } catch (e: any) {
    record('GET nonexistent campaign', e.response?.status === 404, `Status: ${e.response?.status}`);
  }

  // --- 10. UPDATE campaign ---
  try {
    const res = await axios.put(
      `${BASE_URL}/campaigns/${createdCampaignId}`,
      { name: 'Test Campaign Q1 Updated', status: 'PLANNED' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    record('UPDATE campaign', res.status === 200 && res.data.data.name === 'Test Campaign Q1 Updated', `Name: ${res.data.data.name}, Status: ${res.data.data.status}`);
  } catch (e: any) {
    record('UPDATE campaign', false, e.response?.data?.error || e.message);
  }

  // --- 11. Invalid status transition ---
  try {
    await axios.put(
      `${BASE_URL}/campaigns/${createdCampaignId}`,
      { status: 'COMPLETED' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    record('Invalid status transition', false, 'Should have returned 422 (PLANNED -> COMPLETED not allowed)');
  } catch (e: any) {
    const status = e.response?.status;
    record('Invalid status transition', status === 422, `Status: ${status}, Message: ${e.response?.data?.error}`);
  }

  // --- 12. MANAGER can create ---
  let managerCampaignId: string;
  try {
    const res = await axios.post(
      `${BASE_URL}/campaigns`,
      {
        name: 'Manager Campaign',
        clientId,
        type: 'SEO',
        startDate: '2026-02-01',
        endDate: '2026-08-01',
        budget: '3000',
      },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    managerCampaignId = res.data.data.id;
    record('MANAGER create campaign', res.status === 201, `ID: ${managerCampaignId}`);
  } catch (e: any) {
    record('MANAGER create campaign', false, e.response?.data?.error || e.message);
    managerCampaignId = '';
  }

  // --- 13. TEAM_MEMBER can GET campaigns ---
  try {
    const res = await axios.get(`${BASE_URL}/campaigns`, {
      headers: { Authorization: `Bearer ${teamToken}` },
    });
    record('TEAM_MEMBER GET campaigns', res.status === 200, `Count: ${res.data.data.length}`);
  } catch (e: any) {
    record('TEAM_MEMBER GET campaigns', false, e.message);
  }

  // --- 14. TEAM_MEMBER GET /my ---
  try {
    const res = await axios.get(`${BASE_URL}/campaigns/my`, {
      headers: { Authorization: `Bearer ${teamToken}` },
    });
    record('TEAM_MEMBER GET /my', res.status === 200, `Count: ${res.data.data.length}`);
  } catch (e: any) {
    record('TEAM_MEMBER GET /my', false, e.message);
  }

  // --- 15. Filter campaigns by status ---
  try {
    const res = await axios.get(`${BASE_URL}/campaigns?status=PLANNED`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allPlanned = res.data.data.every((c: any) => c.status === 'PLANNED');
    record('Filter by status', res.status === 200 && allPlanned, `Count: ${res.data.data.length}, All PLANNED: ${allPlanned}`);
  } catch (e: any) {
    record('Filter by status', false, e.message);
  }

  // --- 16. Filter campaigns by type ---
  try {
    const res = await axios.get(`${BASE_URL}/campaigns?type=SOCIAL_MEDIA`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allMatch = res.data.data.every((c: any) => c.type === 'SOCIAL_MEDIA');
    record('Filter by type', res.status === 200 && allMatch, `Count: ${res.data.data.length}, All SOCIAL_MEDIA: ${allMatch}`);
  } catch (e: any) {
    record('Filter by type', false, e.message);
  }

  // --- 17. Search campaigns ---
  try {
    const res = await axios.get(`${BASE_URL}/campaigns?search=Q1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Search campaigns', res.status === 200 && res.data.data.length > 0, `Found: ${res.data.data.length}`);
  } catch (e: any) {
    record('Search campaigns', false, e.message);
  }

  // --- 18. DELETE campaign (cleanup manager campaign) ---
  if (managerCampaignId) {
    try {
      const res = await axios.delete(`${BASE_URL}/campaigns/${managerCampaignId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('DELETE campaign', res.status === 200, `Deleted: ${managerCampaignId}`);
    } catch (e: any) {
      record('DELETE campaign', false, e.message);
    }
  }

  // --- 19. DELETE nonexistent campaign ---
  try {
    await axios.delete(`${BASE_URL}/campaigns/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('DELETE nonexistent', false, 'Should have returned 404');
  } catch (e: any) {
    record('DELETE nonexistent', e.response?.status === 404, `Status: ${e.response?.status}`);
  }

  // --- 20. TEAM_MEMBER cannot delete ---
  try {
    await axios.delete(`${BASE_URL}/campaigns/${createdCampaignId}`, {
      headers: { Authorization: `Bearer ${teamToken}` },
    });
    record('TEAM_MEMBER DELETE forbidden', false, 'Should have returned 403');
  } catch (e: any) {
    record('TEAM_MEMBER DELETE forbidden', e.response?.status === 403, `Status: ${e.response?.status}`);
  }

  // --- 21. Activity records created ---
  try {
    const res = await axios.get(`${BASE_URL}/campaigns/${createdCampaignId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Campaign still exists after all tests', res.status === 200, `Name: ${res.data.data.name}`);
  } catch (e: any) {
    record('Campaign still exists after all tests', false, e.message);
  }

  // --- Summary ---
  console.log('\n--- SUMMARY ---');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Passed: ${passed}/${results.length}, Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter((r) => !r.passed).forEach((r) => console.log(`  ✗ ${r.name}: ${r.detail}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});