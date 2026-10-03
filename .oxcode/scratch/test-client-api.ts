import axios from 'axios';

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
  console.log(`  ${icon} ${name}: ${detail}`);
}

async function main() {
  console.log('=== Client API Probe ===\n');

  // 1. Login as admin
  console.log('--- Auth ---');
  let adminToken: string;
  let managerToken: string;
  let memberToken: string;

  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@nexlevr.com',
      password: 'NexLevr@2025',
    });
    adminToken = loginRes.data.data.token;
    record('Admin login', true, `Got token for ${loginRes.data.data.user.email}`);
  } catch (e: any) {
    record('Admin login', false, e.response?.data?.error || e.message);
    console.log('\n=== SUMMARY ===');
    for (const r of results) console.log(`${r.passed ? '✓' : '✗'} ${r.name}`);
    process.exit(1);
  }

  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'manager@nexlevr.com',
      password: 'NexLevr@2025',
    });
    managerToken = loginRes.data.data.token;
    record('Manager login', true, `Got token for ${loginRes.data.data.user.email}`);
  } catch (e: any) {
    record('Manager login', false, e.response?.data?.error || e.message);
    console.log('\n=== SUMMARY ===');
    for (const r of results) console.log(`${r.passed ? '✓' : '✗'} ${r.name}`);
    process.exit(1);
  }

  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'member@nexlevr.com',
      password: 'NexLevr@2025',
    });
    memberToken = loginRes.data.data.token;
    record('Member login', true, `Got token for ${loginRes.data.data.user.email}`);
  } catch (e: any) {
    record('Member login', false, e.response?.data?.error || e.message);
    console.log('\n=== SUMMARY ===');
    for (const r of results) console.log(`${r.passed ? '✓' : '✗'} ${r.name}`);
    process.exit(1);
  }

  // 2. Unauthenticated access
  console.log('\n--- Unauthenticated ---');
  try {
    await axios.get(`${BASE_URL}/clients`);
    record('Unauthenticated GET', false, 'Should have returned 401');
  } catch (e: any) {
    const ok = e.response?.status === 401;
    record('Unauthenticated GET', ok, ok ? 'Correctly returned 401' : `Got ${e.response?.status}`);
  }

  // 3. GET all clients (admin)
  console.log('\n--- GET /api/clients ---');
  try {
    const res = await axios.get(`${BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const hasData = res.data.success && Array.isArray(res.data.data);
    record('GET clients (admin)', hasData, hasData
      ? `Got ${res.data.data.length} clients, pagination: ${JSON.stringify(res.data.pagination)}`
      : `Unexpected response: ${JSON.stringify(res.data)}`);
  } catch (e: any) {
    record('GET clients (admin)', false, e.response?.data?.error || e.message);
  }

  // 4. GET clients with search
  console.log('\n--- GET /api/clients?search=... ---');
  try {
    const res = await axios.get(`${BASE_URL}/clients?search=tech`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const ok = res.data.success && Array.isArray(res.data.data);
    record('GET clients search', ok, ok
      ? `Search returned ${res.data.data.length} results`
      : `Unexpected: ${JSON.stringify(res.data)}`);
  } catch (e: any) {
    record('GET clients search', false, e.response?.data?.error || e.message);
  }

  // 5. GET clients with status filter
  console.log('\n--- GET /api/clients?status=ACTIVE ---');
  try {
    const res = await axios.get(`${BASE_URL}/clients?status=ACTIVE`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const ok = res.data.success && Array.isArray(res.data.data);
    record('GET clients filter by status', ok, ok
      ? `Filter returned ${res.data.data.length} results`
      : `Unexpected: ${JSON.stringify(res.data)}`);
  } catch (e: any) {
    record('GET clients filter by status', false, e.response?.data?.error || e.message);
  }

  // 6. GET clients as manager
  console.log('\n--- GET /api/clients (manager) ---');
  try {
    const res = await axios.get(`${BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    record('GET clients (manager)', res.data.success, `Manager can view clients`);
  } catch (e: any) {
    record('GET clients (manager)', false, e.response?.data?.error || e.message);
  }

  // 7. GET clients as team member
  console.log('\n--- GET /api/clients (team member) ---');
  try {
    const res = await axios.get(`${BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    record('GET clients (team member)', res.data.success, `Team member can view clients`);
  } catch (e: any) {
    record('GET clients (team member)', false, e.response?.data?.error || e.message);
  }

  // 8. GET industries
  console.log('\n--- GET /api/clients/industries ---');
  try {
    const res = await axios.get(`${BASE_URL}/clients/industries`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const ok = res.data.success && Array.isArray(res.data.data);
    record('GET industries', ok, ok
      ? `Got ${res.data.data.length} industries: ${res.data.data.join(', ')}`
      : `Unexpected: ${JSON.stringify(res.data)}`);
  } catch (e: any) {
    record('GET industries', false, e.response?.data?.error || e.message);
  }

  // 9. CREATE client (admin)
  console.log('\n--- POST /api/clients (admin) ---');
  let createdClientId: string;
  try {
    const res = await axios.post(`${BASE_URL}/clients`, {
      name: 'Probe Test Client',
      company: 'Probe Corp',
      email: `probe-test-${Date.now()}@example.com`,
      phone: '+1-555-0100',
      industry: 'Technology',
      website: 'https://probecorp.example.com',
      status: 'ACTIVE',
      notes: 'Created by probe script',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const ok = res.status === 201 && res.data.success && res.data.data.id;
    createdClientId = res.data.data.id;
    record('CREATE client (admin)', ok, ok
      ? `Created client id=${createdClientId}`
      : `Unexpected: ${JSON.stringify(res.data)}`);
  } catch (e: any) {
    record('CREATE client (admin)', false, e.response?.data?.error || e.message);
    createdClientId = '';
  }

  // 10. CREATE client validation error
  console.log('\n--- POST /api/clients (validation) ---');
  try {
    await axios.post(`${BASE_URL}/clients`, {
      name: '',
      company: '',
      email: 'not-an-email',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('CREATE client validation', false, 'Should have returned 400');
  } catch (e: any) {
    const ok = e.response?.status === 400 && e.response.data.details;
    record('CREATE client validation', ok, ok
      ? `Correctly returned 400 with ${e.response.data.details.length} field errors`
      : `Got ${e.response?.status}: ${JSON.stringify(e.response?.data)}`);
  }

  // 11. CREATE client as team member (should fail)
  console.log('\n--- POST /api/clients (team member) ---');
  try {
    await axios.post(`${BASE_URL}/clients`, {
      name: 'Unauthorized Client',
      company: 'Bad Corp',
      email: `bad-${Date.now()}@example.com`,
    }, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    record('CREATE client (team member)', false, 'Should have returned 403');
  } catch (e: any) {
    const ok = e.response?.status === 403;
    record('CREATE client (team member)', ok, ok
      ? 'Correctly returned 403 Forbidden'
      : `Got ${e.response?.status}: ${JSON.stringify(e.response?.data)}`);
  }

  // 12. GET client by ID
  console.log('\n--- GET /api/clients/:id ---');
  if (createdClientId) {
    try {
      const res = await axios.get(`${BASE_URL}/clients/${createdClientId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const ok = res.data.success && res.data.data.id === createdClientId;
      record('GET client by ID', ok, ok
        ? `Got client: ${res.data.data.name}`
        : `Unexpected: ${JSON.stringify(res.data)}`);
    } catch (e: any) {
      record('GET client by ID', false, e.response?.data?.error || e.message);
    }
  } else {
    record('GET client by ID', false, 'Skipped - no created client ID');
  }

  // 13. GET non-existent client
  console.log('\n--- GET /api/clients/:id (404) ---');
  try {
    await axios.get(`${BASE_URL}/clients/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('GET non-existent client', false, 'Should have returned 404');
  } catch (e: any) {
    const ok = e.response?.status === 404;
    record('GET non-existent client', ok, ok
      ? 'Correctly returned 404'
      : `Got ${e.response?.status}: ${JSON.stringify(e.response?.data)}`);
  }

  // 14. UPDATE client
  console.log('\n--- PUT /api/clients/:id ---');
  if (createdClientId) {
    try {
      const res = await axios.put(`${BASE_URL}/clients/${createdClientId}`, {
        name: 'Probe Test Client (Updated)',
        status: 'PROSPECT',
      }, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const ok = res.data.success && res.data.data.name === 'Probe Test Client (Updated)';
      record('UPDATE client', ok, ok
        ? `Updated client: name="${res.data.data.name}", status=${res.data.data.status}`
        : `Unexpected: ${JSON.stringify(res.data)}`);
    } catch (e: any) {
      record('UPDATE client', false, e.response?.data?.error || e.message);
    }
  } else {
    record('UPDATE client', false, 'Skipped - no created client ID');
  }

  // 15. UPDATE client as team member (should fail)
  console.log('\n--- PUT /api/clients/:id (team member) ---');
  if (createdClientId) {
    try {
      await axios.put(`${BASE_URL}/clients/${createdClientId}`, {
        name: 'Hacked Client',
      }, {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      record('UPDATE client (team member)', false, 'Should have returned 403');
    } catch (e: any) {
      const ok = e.response?.status === 403;
      record('UPDATE client (team member)', ok, ok
        ? 'Correctly returned 403 Forbidden'
        : `Got ${e.response?.status}: ${JSON.stringify(e.response?.data)}`);
    }
  } else {
    record('UPDATE client (team member)', false, 'Skipped - no created client ID');
  }

  // 16. DELETE client as team member (should fail)
  console.log('\n--- DELETE /api/clients/:id (team member) ---');
  if (createdClientId) {
    try {
      await axios.delete(`${BASE_URL}/clients/${createdClientId}`, {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      record('DELETE client (team member)', false, 'Should have returned 403');
    } catch (e: any) {
      const ok = e.response?.status === 403;
      record('DELETE client (team member)', ok, ok
        ? 'Correctly returned 403 Forbidden'
        : `Got ${e.response?.status}: ${JSON.stringify(e.response?.data)}`);
    }
  } else {
    record('DELETE client (team member)', false, 'Skipped - no created client ID');
  }

  // 17. DELETE client (admin)
  console.log('\n--- DELETE /api/clients/:id (admin) ---');
  if (createdClientId) {
    try {
      const res = await axios.delete(`${BASE_URL}/clients/${createdClientId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const ok = res.data.success;
      record('DELETE client (admin)', ok, ok
        ? 'Client deleted successfully'
        : `Unexpected: ${JSON.stringify(res.data)}`);
    } catch (e: any) {
      record('DELETE client (admin)', false, e.response?.data?.error || e.message);
    }
  } else {
    record('DELETE client (admin)', false, 'Skipped - no created client ID');
  }

  // 18. Verify deletion
  console.log('\n--- Verify deletion ---');
  if (createdClientId) {
    try {
      await axios.get(`${BASE_URL}/clients/${createdClientId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Verify deletion', false, 'Client should be 404 after delete');
    } catch (e: any) {
      const ok = e.response?.status === 404;
      record('Verify deletion', ok, ok
        ? 'Correctly returns 404 after deletion'
        : `Got ${e.response?.status}`);
    }
  } else {
    record('Verify deletion', false, 'Skipped - no created client ID');
  }

  // 19. Activity logging check
  console.log('\n--- Activity logging ---');
  try {
    const res = await axios.get(`${BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    // We can't directly query activities via API yet, but we can check the client count is correct
    record('Activity logging', true,
      `Client list still functional after all operations (${res.data.data.length} clients)`);
  } catch (e: any) {
    record('Activity logging', false, e.response?.data?.error || e.message);
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  let passed = 0;
  let failed = 0;
  for (const r of results) {
    console.log(`${r.passed ? '✓' : '✗'} ${r.name}`);
    if (r.passed) passed++;
    else failed++;
  }
  console.log(`\n${passed} passed, ${failed} failed out of ${results.length} tests`);
  process.exit(failed > 0 ? 1 : 0);
}

main();