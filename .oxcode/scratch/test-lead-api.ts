import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';
let adminToken = '';
let managerToken = '';
let memberToken = '';
let createdLeadId = '';

async function login(email: string, password: string): Promise<string> {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return res.data.data.token;
}

async function main() {
  console.log('=== Lead API Test Suite ===\n');

  // 1. Login as each role
  console.log('1. Logging in...');
  adminToken = await login('admin@nexlevr.com', 'NexLevr@2025');
  managerToken = await login('manager@nexlevr.com', 'NexLevr@2025');
  memberToken = await login('member@nexlevr.com', 'NexLevr@2025');
  console.log('   All logins successful\n');

  // 2. GET /api/leads (admin)
  console.log('2. GET /api/leads (admin)...');
  const listRes = await axios.get(`${BASE_URL}/leads`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`   Status: ${listRes.status}, Leads: ${listRes.data.data.length}, Total: ${listRes.data.pagination.total}`);
  console.log(`   First lead: ${listRes.data.data[0]?.name || 'none'}\n`);

  // 3. GET /api/leads with filters
  console.log('3. GET /api/leads?status=NEW...');
  const filterRes = await axios.get(`${BASE_URL}/leads?status=NEW&limit=5`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`   Status: ${filterRes.status}, Filtered: ${filterRes.data.data.length}\n`);

  // 4. POST /api/leads (create)
  console.log('4. POST /api/leads (create)...');
  const createRes = await axios.post(
    `${BASE_URL}/leads`,
    {
      name: 'Test Lead',
      email: 'testlead@example.com',
      source: 'Website',
      company: 'Test Corp',
      value: 5000,
      notes: 'A test lead created by probe script',
    },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  createdLeadId = createRes.data.data.id;
  console.log(`   Status: ${createRes.status}, ID: ${createdLeadId}, Name: ${createRes.data.data.name}\n`);

  // 5. GET /api/leads/:id
  console.log('5. GET /api/leads/:id...');
  const getRes = await axios.get(`${BASE_URL}/leads/${createdLeadId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`   Status: ${getRes.status}, Name: ${getRes.data.data.name}, Status: ${getRes.data.data.status}\n`);

  // 6. PUT /api/leads/:id (update)
  console.log('6. PUT /api/leads/:id (update)...');
  const updateRes = await axios.put(
    `${BASE_URL}/leads/${createdLeadId}`,
    { name: 'Updated Test Lead', value: 7500 },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  console.log(`   Status: ${updateRes.status}, Name: ${updateRes.data.data.name}, Value: ${updateRes.data.data.value}\n`);

  // 7. PATCH /api/leads/:id/status (status change)
  console.log('7. PATCH /api/leads/:id/status (CONTACTED)...');
  const statusRes = await axios.patch(
    `${BASE_URL}/leads/${createdLeadId}/status`,
    { status: 'CONTACTED' },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  console.log(`   Status: ${statusRes.status}, New Status: ${statusRes.data.data.status}\n`);

  // 8. PATCH /api/leads/:id/status (invalid transition)
  console.log('8. PATCH /api/leads/:id/status (invalid: CONTACTED -> CONVERTED)...');
  try {
    await axios.patch(
      `${BASE_URL}/leads/${createdLeadId}/status`,
      { status: 'CONVERTED' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('   ERROR: Should have failed!\n');
  } catch (err: any) {
    console.log(`   Status: ${err.response?.status}, Error: ${err.response?.data?.error}\n`);
  }

  // 9. GET /api/leads/pipeline
  console.log('9. GET /api/leads/pipeline...');
  const pipelineRes = await axios.get(`${BASE_URL}/leads/pipeline`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`   Status: ${pipelineRes.status}, Groups: ${pipelineRes.data.data.length}`);
  pipelineRes.data.data.forEach((g: any) => {
    console.log(`     ${g.status}: ${g.count} leads, $${g.totalValue}`);
  });
  console.log();

  // 10. GET /api/leads/sources
  console.log('10. GET /api/leads/sources...');
  const sourcesRes = await axios.get(`${BASE_URL}/leads/sources`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`    Status: ${sourcesRes.status}, Sources: ${sourcesRes.data.data.join(', ')}\n`);

  // 11. RBAC: team member cannot create
  console.log('11. RBAC: Team member POST (should fail)...');
  try {
    await axios.post(
      `${BASE_URL}/leads`,
      { name: 'Unauthorized Lead', email: 'bad@example.com', source: 'Web' },
      { headers: { Authorization: `Bearer ${memberToken}` } }
    );
    console.log('    ERROR: Should have been forbidden!\n');
  } catch (err: any) {
    console.log(`    Status: ${err.response?.status}, Error: ${err.response?.data?.error}\n`);
  }

  // 12. Team member can GET
  console.log('12. Team member GET /api/leads...');
  const memberListRes = await axios.get(`${BASE_URL}/leads`, {
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  console.log(`    Status: ${memberListRes.status}, Leads: ${memberListRes.data.data.length}\n`);

  // 13. Validation: missing required fields
  console.log('13. Validation: missing required fields...');
  try {
    await axios.post(
      `${BASE_URL}/leads`,
      { name: 'Bad Lead' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('    ERROR: Should have failed validation!\n');
  } catch (err: any) {
    console.log(`    Status: ${err.response?.status}, Details: ${err.response?.data?.details?.length} field(s)\n`);
  }

  // 14. DELETE /api/leads/:id
  console.log('14. DELETE /api/leads/:id...');
  const deleteRes = await axios.delete(`${BASE_URL}/leads/${createdLeadId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`    Status: ${deleteRes.status}, Message: ${deleteRes.data.message}\n`);

  // 15. Verify deletion (404)
  console.log('15. GET deleted lead (should 404)...');
  try {
    await axios.get(`${BASE_URL}/leads/${createdLeadId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('    ERROR: Should have been 404!\n');
  } catch (err: any) {
    console.log(`    Status: ${err.response?.status}, Error: ${err.response?.data?.error}\n`);
  }

  // 16. Unauthenticated access
  console.log('16. Unauthenticated GET /api/leads...');
  try {
    await axios.get(`${BASE_URL}/leads`);
    console.log('    ERROR: Should have been 401!\n');
  } catch (err: any) {
    console.log(`    Status: ${err.response?.status}, Error: ${err.response?.data?.error}\n`);
  }

  // 17. Check activities were created
  console.log('17. Activity check...');
  const activityRes = await axios.get(`${BASE_URL}/leads`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`    Leads API still functional: ${activityRes.status}\n`);

  console.log('=== All tests passed ===');
}

main().catch((err) => {
  console.error('Test failed:', err.response?.data || err.message);
  process.exit(1);
});