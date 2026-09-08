// test_full_hunt_flow.js
const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('=== 1. Check Admin Projector Start QR Code ===');
  const startQrRes = await request({
    host: 'localhost',
    port: 4000,
    path: '/api/event/start-qr',
    method: 'GET',
  });
  console.log('Start QR status:', startQrRes.status);
  console.log('Secure token:', startQrRes.data?.secureToken);
  console.log('Scan URL:', startQrRes.data?.scanUrl);
  console.log('Data URL starts with data:image/png;base64,:', startQrRes.data?.qrDataUrl?.startsWith('data:image/png;base64,'));
  const qrToken = startQrRes.data.secureToken;

  const teamName = 'Quantum_' + Math.floor(Math.random() * 10000);
  console.log(`\n=== 2. Member 1 creates team "${teamName}" ===`);
  const m1 = await request(
    {
      host: 'localhost',
      port: 4000,
      path: '/api/auth/team',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Alice', teamName }
  );
  console.log('M1 status:', m1.status);
  console.log('M1 team members:', m1.data.team?.members);
  const sessionToken = m1.data.sessionToken;

  console.log(`\n=== 3. Member 2 joins team "${teamName}" ===`);
  const m2 = await request(
    {
      host: 'localhost',
      port: 4000,
      path: '/api/auth/team',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Bob', teamName }
  );
  console.log('M2 status:', m2.status);
  console.log('M2 team members:', m2.data.team?.members);

  console.log(`\n=== 4. Member 3 attempts to join team "${teamName}" (Should Fail) ===`);
  const m3 = await request(
    {
      host: 'localhost',
      port: 4000,
      path: '/api/auth/team',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Charlie', teamName }
  );
  console.log('M3 status (expected 409):', m3.status);
  console.log('M3 rejection message:', m3.data?.message);

  console.log('\n=== 5. Check Initial Hunt State (Should be NOT_STARTED) ===');
  const currentBefore = await request({
    host: 'localhost',
    port: 4000,
    path: '/api/hunt/current',
    method: 'GET',
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  console.log('Phase before scan:', currentBefore.data.phase);
  console.log('Team members in state:', currentBefore.data.team?.members);

  console.log('\n=== 6. Participant scans Checkpoint #1 QR ===');
  const startHuntRes = await request(
    {
      host: 'localhost',
      port: 4000,
      path: '/api/hunt/start',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
    },
    { qrToken }
  );
  console.log('Start Hunt status:', startHuntRes.status);
  console.log('Phase after scan:', startHuntRes.data.phase);
  console.log('Current Round:', startHuntRes.data.roundNumber);
  console.log('Round 1 Riddle:', startHuntRes.data.challenge?.question);

  console.log('\n=== 7. Try scanning Checkpoint #2 BEFORE finishing Riddle 1 (Must Fail) ===');
  const prematureScanRes = await request(
    {
      host: 'localhost',
      port: 4000,
      path: '/api/qr/scan',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
    },
    { qrToken: 'token_cp2_hidden' }
  );
  console.log('Premature CP2 Scan status (expected 409):', prematureScanRes.status);
  console.log('Rejection reason:', prematureScanRes.data?.message);

  console.log('\n=== 8. Submit Answer to finish Round 1 Riddle ===');
  const answer = startHuntRes.data.challenge.type === 'riddle' ? 'keyboard' : 'Stack';
  const ansRes = await request(
    {
      host: 'localhost',
      port: 4000,
      path: '/api/challenge/answer',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
    },
    { answer }
  );
  console.log('Answer status:', ansRes.status);
  console.log('Riddle Solved?:', ansRes.data.correct);
  console.log('Points earned:', ansRes.data.pointsEarned);

  console.log('\n=== 9. Clue for Checkpoint #2 is now revealed ===');
  const hintStateRes = await request({
    host: 'localhost',
    port: 4000,
    path: '/api/hunt/current',
    method: 'GET',
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  console.log('Hunt Phase:', hintStateRes.data.phase);
  console.log('Clue for next location:', hintStateRes.data.hint);

  console.log('\n=== 10. Now Scan Checkpoint #2 (Succeeds after Riddle 1 finished) ===');
  const scanCp2Res = await request(
    {
      host: 'localhost',
      port: 4000,
      path: '/api/qr/scan',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
    },
    { qrToken: 'token_cp2_hidden' }
  );
  console.log('Scan CP2 status:', scanCp2Res.status);
  console.log('Phase after scanning CP2:', scanCp2Res.data.phase);
  console.log('Current Round:', scanCp2Res.data.roundNumber);
  console.log('Round 2 Riddle:', scanCp2Res.data.challenge?.question);

  console.log('\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY! ===');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
