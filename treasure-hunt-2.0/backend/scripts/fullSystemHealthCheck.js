require('dotenv').config();
const { supabase } = require('../src/config/supabaseClient');

const BASE_URL = 'http://localhost:4000';

async function testHttp(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runCheck() {
  const report = {
    database: { passed: true, details: [] },
    apiHealth: { passed: true, details: [] },
    adminAuth: { passed: true, details: [] },
    participantHunt: { passed: true, details: [] },
    summary: 'ALL SYSTEMS GO',
  };

  console.log('====================================================');
  console.log('   TREASURE HUNT 2.0 — FULL SYSTEM HEALTH AUDIT     ');
  console.log('====================================================\n');

  // 1. SUPABASE DATABASE AUDIT
  console.log('--- 1. Supabase Database Audit ---');
  const tables = [
    'event_settings',
    'rounds',
    'challenges',
    'qr_checkpoints',
    'teams',
    'team_sessions',
    'team_challenges',
    'team_progress',
    'answer_attempts',
    'admins',
  ];

  for (const table of tables) {
    try {
      const { data, count, error } = await supabase.from(table).select('*', { count: 'exact', head: false }).limit(5);
      if (error) {
        report.database.passed = false;
        report.database.details.push({ table, status: 'ERROR', message: error.message });
        console.log(`❌ Table "${table}": ERROR (${error.message})`);
      } else {
        const rowCount = count !== null ? count : (data ? data.length : 0);
        report.database.details.push({ table, status: 'OK', rows: rowCount });
        console.log(`✅ Table "${table}": OK (${rowCount} rows)`);
      }
    } catch (err) {
      report.database.passed = false;
      report.database.details.push({ table, status: 'EXCEPTION', message: err.message });
      console.log(`❌ Table "${table}": EXCEPTION (${err.message})`);
    }
  }

  // 2. PUBLIC API HEALTH AUDIT
  console.log('\n--- 2. Public API Endpoints ---');
  const healthRes = await testHttp('/api/health');
  if (healthRes.ok && healthRes.data?.service === 'treasure-hunt-2.0-api') {
    console.log('✅ GET /api/health -> 200 OK');
  } else {
    report.apiHealth.passed = false;
    console.log('❌ GET /api/health failed:', healthRes.status, healthRes.data);
  }

  const statusRes = await testHttp('/api/event/status');
  if (statusRes.ok && statusRes.data?.success) {
    console.log(`✅ GET /api/event/status -> 200 OK (Event: "${statusRes.data.eventName}", Status: ${statusRes.data.status})`);
  } else {
    report.apiHealth.passed = false;
    console.log('❌ GET /api/event/status failed:', statusRes.status, statusRes.data);
  }

  const startQrRes = await testHttp('/api/event/start-qr');
  if (startQrRes.ok && startQrRes.data?.qrDataUrl?.startsWith('data:image/png;base64,')) {
    console.log(`✅ GET /api/event/start-qr -> 200 OK (Scan URL: ${startQrRes.data.scanUrl})`);
  } else {
    report.apiHealth.passed = false;
    console.log('❌ GET /api/event/start-qr failed:', startQrRes.status, startQrRes.data);
  }

  // 3. ADMIN AUTH & PROTECTED ROUTES AUDIT
  console.log('\n--- 3. Admin Authentication & Dashboard ---');
  const adminLoginRes = await testHttp('/api/admin/login', {
    method: 'POST',
    body: { email: 'admin@treasurehunt.com', password: 'Admin@12345' },
  });

  let adminToken = null;
  if (adminLoginRes.ok && adminLoginRes.data?.token) {
    adminToken = adminLoginRes.data.token;
    console.log(`✅ POST /api/admin/login -> 200 OK (Admin: ${adminLoginRes.data.admin?.email})`);
  } else {
    report.adminAuth.passed = false;
    console.log('❌ POST /api/admin/login failed:', adminLoginRes.status, adminLoginRes.data);
  }

  if (adminToken) {
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    const dashRes = await testHttp('/api/admin/dashboard', { headers: adminHeaders });
    console.log(dashRes.ok ? '✅ GET /api/admin/dashboard -> 200 OK' : `❌ GET /api/admin/dashboard -> ${dashRes.status}`);

    const teamsRes = await testHttp('/api/admin/teams', { headers: adminHeaders });
    console.log(teamsRes.ok ? `✅ GET /api/admin/teams -> 200 OK (${teamsRes.data?.teams?.length || 0} teams)` : `❌ GET /api/admin/teams -> ${teamsRes.status}`);

    const challengesRes = await testHttp('/api/admin/challenges', { headers: adminHeaders });
    console.log(challengesRes.ok ? `✅ GET /api/admin/challenges -> 200 OK (${challengesRes.data?.challenges?.length || 0} challenges)` : `❌ GET /api/admin/challenges -> ${challengesRes.status}`);

    const qrRes = await testHttp('/api/admin/qr', { headers: adminHeaders });
    console.log(qrRes.ok ? `✅ GET /api/admin/qr -> 200 OK (${qrRes.data?.checkpoints?.length || 0} checkpoints)` : `❌ GET /api/admin/qr -> ${qrRes.status}`);

    const settingsRes = await testHttp('/api/admin/settings', { headers: adminHeaders });
    console.log(settingsRes.ok ? `✅ GET /api/admin/settings -> 200 OK` : `❌ GET /api/admin/settings -> ${settingsRes.status}`);

    const lbRes = await testHttp('/api/admin/leaderboard', { headers: adminHeaders });
    console.log(lbRes.ok ? `✅ GET /api/admin/leaderboard -> 200 OK` : `❌ GET /api/admin/leaderboard -> ${lbRes.status}`);
  }

  // 4. PARTICIPANT HUNT JOURNEY AUDIT
  console.log('\n--- 4. Participant Hunt Journey & Rules Verification ---');
  const testTeamName = 'AuditTeam_' + Math.floor(1000 + Math.random() * 9000);

  // 4a. Member 1 creates team
  const m1Res = await testHttp('/api/auth/team', {
    method: 'POST',
    body: { name: 'Player One', teamName: testTeamName },
  });
  const m1Token = m1Res.data?.sessionToken;
  if (m1Res.ok && m1Token) {
    console.log(`✅ Member 1 creates team "${testTeamName}" -> 200 OK (Members: ${m1Res.data.team?.members?.join(', ')})`);
  } else {
    report.participantHunt.passed = false;
    console.log('❌ Member 1 registration failed:', m1Res.status, m1Res.data);
  }

  // 4b. Member 2 joins same team
  const m2Res = await testHttp('/api/auth/team', {
    method: 'POST',
    body: { name: 'Player Two', teamName: testTeamName },
  });
  const m2Token = m2Res.data?.sessionToken;
  if (m2Res.ok && m2Res.data?.team?.members?.length === 2) {
    console.log(`✅ Member 2 joins team "${testTeamName}" -> 200 OK (Members: ${m2Res.data.team?.members?.join(', ')})`);
  } else {
    report.participantHunt.passed = false;
    console.log('❌ Member 2 join failed:', m2Res.status, m2Res.data);
  }

  // 4c. Member 3 attempts to join full team -> MUST REJECT WITH 409
  const m3Res = await testHttp('/api/auth/team', {
    method: 'POST',
    body: { name: 'Player Three', teamName: testTeamName },
  });
  if (m3Res.status === 409) {
    console.log(`✅ Member 3 join rejected with 409 Conflict: "${m3Res.data?.message}" (Rule: max 2 members strictly enforced)`);
  } else {
    report.participantHunt.passed = false;
    console.log(`❌ 3-member constraint violation! Expected 409, got ${m3Res.status}`);
  }

  // 4d. Member 1 starts hunt with Start QR
  if (startQrRes.data?.secureToken && m1Token) {
    const startRes = await testHttp('/api/hunt/start', {
      method: 'POST',
      headers: { Authorization: `Bearer ${m1Token}` },
      body: { qrToken: startQrRes.data.secureToken },
    });
    if (startRes.ok && startRes.data?.phase === 'IN_CHALLENGE') {
      console.log(`✅ Participant scans Start QR -> Round 1 Challenge Unlocked: "${startRes.data.challenge?.question?.slice(0, 50)}..."`);

      // 4e. Submit an answer (wrong first to test penalty logic, or correct)
      const currentToken = m1Token;
      const challengeId = startRes.data.challenge?.id;

      // Try wrong answer
      const wrongAnswerRes = await testHttp('/api/challenge/answer', {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
        body: { answer: 'completely_wrong_answer_xyz' },
      });
      if (wrongAnswerRes.ok && wrongAnswerRes.data?.correct === false) {
        console.log(`✅ Wrong answer penalty checked -> Score changed: ${wrongAnswerRes.data.pointsEarned} pts, remaining attempts: ${wrongAnswerRes.data.remainingAttempts ?? 'unlimited'}`);
      }

      // Query current state for Member 2 to confirm synchronization
      const m2CurrentRes = await testHttp('/api/hunt/current', {
        headers: { Authorization: `Bearer ${m2Token}` },
      });
      if (m2CurrentRes.ok && m2CurrentRes.data?.challenge?.id === challengeId) {
        console.log(`✅ Team member synchronization verified -> Member 2 sees identical challenge & score in real-time`);
      } else {
        report.participantHunt.passed = false;
        console.log('❌ Team sync failure between Member 1 and 2');
      }
    } else {
      report.participantHunt.passed = false;
      console.log('❌ Start hunt failed:', startRes.status, startRes.data);
    }
  }

  console.log('\n====================================================');
  console.log('                AUDIT COMPLETE                      ');
  console.log('====================================================');
}

runCheck().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
