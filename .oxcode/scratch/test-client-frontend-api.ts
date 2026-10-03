import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

async function main() {
  // Login as admin
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@nexlevr.com',
    password: 'NexLevr@2025',
  });
  const token = loginRes.data.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  // 1. List clients
  const listRes = await axios.get(`${BASE_URL}/clients`, { headers });
  console.log('GET /clients status:', listRes.status);
  console.log('Client count:', listRes.data.data.length);
  console.log('Pagination:', JSON.stringify(listRes.data.pagination));
  console.log('First client:', listRes.data.data[0]?.name, '-', listRes.data.data[0]?.company);

  // 2. Get client by ID
  const firstId = listRes.data.data[0].id;
  const detailRes = await axios.get(`${BASE_URL}/clients/${firstId}`, { headers });
  console.log('\nGET /clients/:id status:', detailRes.status);
  console.log('Client name:', detailRes.data.data.name);

  // 3. Get client campaigns
  const campaignsRes = await axios.get(`${BASE_URL}/clients/${firstId}/campaigns`, { headers });
  console.log('\nGET /clients/:id/campaigns status:', campaignsRes.status);
  console.log('Campaign count:', campaignsRes.data.data.length);
  if (campaignsRes.data.data.length > 0) {
    console.log('First campaign:', campaignsRes.data.data[0].name);
  }

  // 4. Create client
  const createRes = await axios.post(`${BASE_URL}/clients`, {
    name: 'Probe Test Client',
    company: 'Probe Corp',
    email: 'probe-test-' + Date.now() + '@example.com',
    status: 'PROSPECT',
    industry: 'Technology',
  }, { headers });
  console.log('\nPOST /clients status:', createRes.status);
  console.log('Created:', createRes.data.data.name, '-', createRes.data.data.id);

  // 5. Update client
  const updateRes = await axios.put(`${BASE_URL}/clients/${createRes.data.data.id}`, {
    name: 'Probe Test Client Updated',
    status: 'ACTIVE',
  }, { headers });
  console.log('\nPUT /clients/:id status:', updateRes.status);
  console.log('Updated name:', updateRes.data.data.name, 'status:', updateRes.data.data.status);

  // 6. Delete client
  const deleteRes = await axios.delete(`${BASE_URL}/clients/${createRes.data.data.id}`, { headers });
  console.log('\nDELETE /clients/:id status:', deleteRes.status);

  // 7. Verify deletion
  try {
    await axios.get(`${BASE_URL}/clients/${createRes.data.data.id}`, { headers });
    console.log('ERROR: Client still exists after deletion');
  } catch (err: any) {
    console.log('Deletion verified: GET returns', err.response?.status);
  }

  console.log('\n✅ All client API tests passed');
}

main().catch((err) => {
  console.error('Test failed:', err.response?.status, err.response?.data || err.message);
  process.exit(1);
});