const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5001/api';
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const PASSWORD = 'NexLevr@2025';

const ROLES = {
  admin: { email: 'admin@nexlevr.com', expectedRole: 'ADMIN' },
  manager: { email: 'manager@nexlevr.com', expectedRole: 'MANAGER' },
  member: { email: 'member@nexlevr.com', expectedRole: 'TEAM_MEMBER' },
};

const results = [];

function log(severity, message, detail) {
  results.push({ severity, message, detail });
  const prefix = severity === 'PASS' ? '✅' : severity === 'FAIL' ? '❌' : '⚠️';
  console.log(`${prefix} ${message}`, detail || '');
}

async function login(email) {
  const res = await axios.post(`${API}/auth/login`, { email, password: PASSWORD });
  if (!res.data.success) throw new Error('Login failed');
  return { token: res.data.data.token, user: res.data.data.user };
}

function client(token) {
  return axios.create({
    baseURL: API,
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function expectStatus(fn, expected, label) {
  try {
    const res = await fn();
    if (res.status === expected) {
      log('PASS', `${label}: ${expected}`);
      return res;
    }
    log('FAIL', `${label}: expected ${expected}, got ${res.status}`, res.data);
    return res;
  } catch (err) {
    const status = err.response?.status;
    if (status === expected) {
      log('PASS', `${label}: ${expected}`);
      return err.response;
    }
    log('FAIL', `${label}: expected ${expected}, got ${status || err.message}`, err.response?.data);
    return err.response;
  }
}

async function expectOk(fn, label, predicate) {
  try {
    const res = await fn();
    if (res.status === 200 && (!predicate || predicate(res.data))) {
      log('PASS', label, res.data);
      return res;
    }
    log('FAIL', label, { status: res.status, data: res.data });
    return res;
  } catch (err) {
    log('FAIL', label, err.response?.data || err.message);
    return err.response;
  }
}

async function checkFrontendPage(path, label) {
  try {
    const res = await axios.get(`${FRONTEND}${path}`, { timeout: 10000 });
    if (res.status === 200 && res.data.includes('NexLevr')) {
      log('PASS', `Frontend ${label} (${path}) loads`);
    } else {
      log('FAIL', `Frontend ${label} (${path})`, { status: res.status, length: res.data.length });
    }
  } catch (err) {
    log('FAIL', `Frontend ${label} (${path})`, err.message);
  }
}

async function main() {
  console.log(`\n🔌 API: ${API}\n`);

  const sessions = {};
  for (const [key, cfg] of Object.entries(ROLES)) {
    const session = await login(cfg.email);
    sessions[key] = session;
    log('PASS', `${key} login`, session.user.email);
  }

  // Auth me for each role
  for (const [key, { expectedRole }] of Object.entries(ROLES)) {
    const api = client(sessions[key].token);
    const me = await api.get('/auth/me');
    if (me.data.data.user.role === expectedRole) {
      log('PASS', `${key} /auth/me role is ${expectedRole}`);
    } else {
      log('FAIL', `${key} /auth_me role mismatch`, me.data.data.user.role);
    }
  }

  // Dashboard analytics for each role
  for (const key of Object.keys(ROLES)) {
    const api = client(sessions[key].token);
    await expectOk(() => api.get('/analytics/dashboard'), `${key} dashboard analytics`, (d) => d.data && typeof d.data.totalClients === 'number');
  }

  // Common data endpoints for each role
  for (const key of Object.keys(ROLES)) {
    const api = client(sessions[key].token);
    await expectOk(() => api.get('/clients'), `${key} clients list`, (d) => Array.isArray(d.data) && d.data.length > 0);
    await expectOk(() => api.get('/campaigns'), `${key} campaigns list`, (d) => Array.isArray(d.data) && d.data.length > 0);
    await expectOk(() => api.get('/leads'), `${key} leads list`, (d) => Array.isArray(d.data) && d.data.length > 0);
    await expectOk(() => api.get('/tasks'), `${key} tasks list`, (d) => Array.isArray(d.data) && d.data.length > 0);
    await expectOk(() => api.get('/notifications'), `${key} notifications`, (d) => Array.isArray(d.data));
    await expectOk(() => api.get('/activities?limit=10'), `${key} activities`, (d) => Array.isArray(d.data));
  }

  // Admin-only user management
  const adminApi = client(sessions.admin.token);
  await expectOk(() => adminApi.get('/users'), 'admin users list', (d) => Array.isArray(d.data) && d.data.length === 3);
  await expectStatus(() => client(sessions.manager.token).get('/users'), 403, 'manager GET /users blocked');
  await expectStatus(() => client(sessions.member.token).get('/users'), 403, 'member GET /users blocked');

  // Settings profile update (self-service) for each role
  for (const [key, session] of Object.entries(sessions)) {
    const api = client(session.token);
    const newName = `${session.user.name} (Verified)`;
    const res = await api.put(`/users/${session.user.id}`, { name: newName });
    if (res.status === 200 && res.data.data.name === newName) {
      log('PASS', `${key} profile update`, res.data.data.name);
      // restore
      await api.put(`/users/${session.user.id}`, { name: session.user.name });
    } else {
      log('FAIL', `${key} profile update`, res.data);
    }
  }

  // Clients CRUD as admin
  const clientPayload = {
    name: 'Integration Test Client',
    company: 'Integration Test Co',
    email: `integration-${Date.now()}@test.com`,
    phone: '+91 99999 99999',
    industry: 'Technology',
    website: 'https://integration.test',
    status: 'ACTIVE',
    notes: 'Created by integration verification script',
  };
  const createRes = await adminApi.post('/clients', clientPayload);
  if (createRes.status === 201 && createRes.data.data.id) {
    log('PASS', 'admin create client', createRes.data.data.id);
    const clientId = createRes.data.data.id;
    const updateRes = await adminApi.put(`/clients/${clientId}`, { name: 'Integration Test Client Updated' });
    if (updateRes.status === 200) {
      log('PASS', 'admin update client');
    } else {
      log('FAIL', 'admin update client', updateRes.data);
    }
    const deleteRes = await adminApi.delete(`/clients/${clientId}`);
    if (deleteRes.status === 200) {
      log('PASS', 'admin delete client');
    } else {
      log('FAIL', 'admin delete client', deleteRes.data);
    }
  } else {
    log('FAIL', 'admin create client', createRes.data);
  }

  // Lead status move as manager
  const managerApi = client(sessions.manager.token);
  const leadsRes = await managerApi.get('/leads');
  if (leadsRes.data.data.length > 0) {
    const lead = leadsRes.data.data[0];
    const targetStatus = lead.status === 'NEW' ? 'CONTACTED' : 'NEW';
    const moveRes = await managerApi.patch(`/leads/${lead.id}/status`, { status: targetStatus });
    if (moveRes.status === 200) {
      log('PASS', 'manager move lead status', { id: lead.id, status: targetStatus });
      // restore
      await managerApi.patch(`/leads/${lead.id}/status`, { status: lead.status });
    } else {
      log('FAIL', 'manager move lead status', moveRes.data);
    }
  }

  // Task status update as team member (assigned task)
  const memberApi = client(sessions.member.token);
  const tasksRes = await memberApi.get('/tasks');
  const memberTask = tasksRes.data.data.find((t) => t.assignedUserId === sessions.member.user.id);
  if (memberTask) {
    const targetStatus = memberTask.status === 'TODO' ? 'IN_PROGRESS' : 'TODO';
    const moveRes = await memberApi.patch(`/tasks/${memberTask.id}/status`, { status: targetStatus });
    if (moveRes.status === 200) {
      log('PASS', 'member update assigned task status', { id: memberTask.id, status: targetStatus });
      // restore
      await memberApi.patch(`/tasks/${memberTask.id}/status`, { status: memberTask.status });
    } else {
      log('FAIL', 'member update assigned task status', moveRes.data);
    }
  } else {
    log('FAIL', 'member has no assigned task to test status update');
  }

  // Frontend page smoke tests
  console.log('\n🌐 Frontend smoke tests\n');
  await checkFrontendPage('/login', 'login');
  await checkFrontendPage('/dashboard', 'dashboard');
  await checkFrontendPage('/clients', 'clients');
  await checkFrontendPage('/campaigns', 'campaigns');
  await checkFrontendPage('/leads', 'leads');
  await checkFrontendPage('/tasks', 'tasks');
  await checkFrontendPage('/analytics', 'analytics');
  await checkFrontendPage('/settings', 'settings');
  await checkFrontendPage('/admin/users', 'admin users');

  // Summary
  console.log('\n📊 Summary\n');
  const pass = results.filter((r) => r.severity === 'PASS').length;
  const fail = results.filter((r) => r.severity === 'FAIL').length;
  console.log(`Passed: ${pass}, Failed: ${fail}`);
  if (fail > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
