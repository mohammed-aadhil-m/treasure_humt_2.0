const assert = require('assert');

// Mock in-memory database store mimicking Supabase behavior
const db = {
  teams: [],
  sessions: [],
};

function resetDb() {
  db.teams = [];
  db.sessions = [];
}

// Emulate the controller logic
async function simulateTeamLogin({ name, teamName, teamCode }) {
  if (teamName || name) {
    const participantName = typeof name === 'string' ? name.trim() : '';
    const requestedTeamName = typeof teamName === 'string' ? teamName.trim() : '';

    if (!participantName) throw new Error('Please enter your name.');
    if (!requestedTeamName) throw new Error('Please enter your team name.');
    if (participantName.length > 50) throw new Error('Name cannot exceed 50 characters.');
    if (requestedTeamName.length > 50) throw new Error('Team name cannot exceed 50 characters.');

    const existingTeam = db.teams.find(
      (t) => t.team_name.toLowerCase() === requestedTeamName.toLowerCase()
    );

    let team;
    let isNew = false;
    let joinedExisting = false;

    if (!existingTeam) {
      const generatedCode =
        requestedTeamName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) +
        '-' +
        Math.floor(1000 + Math.random() * 9000);

      team = {
        id: 'team-' + (db.teams.length + 1),
        team_name: requestedTeamName,
        team_code: generatedCode,
        members: [participantName],
        status: 'REGISTERED',
        current_round: 0,
        score: 0,
      };
      db.teams.push(team);
      isNew = true;
    } else {
      team = existingTeam;
      const currentMembers = Array.isArray(team.members) ? team.members : [];
      const isAlreadyMember = currentMembers.some(
        (m) => m.trim().toLowerCase() === participantName.toLowerCase()
      );

      if (!isAlreadyMember) {
        if (currentMembers.length >= 2) {
          const err = new Error(
            `Team "${team.team_name}" is already full (maximum 2 members: ${currentMembers.join(', ')}). Please choose a different team name.`
          );
          err.statusCode = 409;
          throw err;
        }

        team.members = [...currentMembers, participantName];
        joinedExisting = true;
      }
    }

    const session = {
      id: 'sess-' + (db.sessions.length + 1),
      team_id: team.id,
      session_token: 'token-' + Math.random().toString(36).slice(2),
    };
    db.sessions.push(session);

    return {
      success: true,
      sessionToken: session.session_token,
      team: {
        id: team.id,
        teamName: team.team_name,
        teamCode: team.team_code,
        members: team.members,
        status: team.status,
      },
      memberName: participantName,
      isNewTeam: isNew,
      joinedExistingTeam: joinedExisting,
    };
  }

  throw new Error('Please enter your Name and Team Name.');
}

async function runTests() {
  console.log('--- Running 2-Member Team Logic Tests ---');
  resetDb();

  // Test 1: Empty validations
  console.log('Test 1: Rejects empty name or team name');
  await assert.rejects(() => simulateTeamLogin({ name: '', teamName: 'Alpha' }), /Please enter your name/);
  await assert.rejects(() => simulateTeamLogin({ name: 'Alice', teamName: '' }), /Please enter your team name/);
  console.log('✓ Passed');

  // Test 2: First member creates team
  console.log('Test 2: Member 1 creates team "CyberKnights"');
  const res1 = await simulateTeamLogin({ name: 'Alice', teamName: 'CyberKnights' });
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.isNewTeam, true);
  assert.strictEqual(res1.team.teamName, 'CyberKnights');
  assert.deepStrictEqual(res1.team.members, ['Alice']);
  console.log('✓ Passed: Alice registered as Member 1 of 2');

  // Test 3: Second member joins same team
  console.log('Test 3: Member 2 ("Bob") joins same team "CyberKnights"');
  const res2 = await simulateTeamLogin({ name: 'Bob', teamName: 'CyberKnights' });
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.joinedExistingTeam, true);
  assert.strictEqual(res2.team.teamName, 'CyberKnights');
  assert.deepStrictEqual(res2.team.members, ['Alice', 'Bob']);
  console.log('✓ Passed: Bob joined as Member 2 of 2 (Team full)');

  // Test 4: Member 1 re-logins to resume session
  console.log('Test 4: Member 1 ("Alice") re-enters to resume session');
  const res3 = await simulateTeamLogin({ name: 'Alice', teamName: 'CyberKnights' });
  assert.strictEqual(res3.success, true);
  assert.strictEqual(res3.isNewTeam, false);
  assert.strictEqual(res3.joinedExistingTeam, false);
  assert.deepStrictEqual(res3.team.members, ['Alice', 'Bob']);
  console.log('✓ Passed: Alice resumed session without duplicating members');

  // Test 5: Member 3 attempts to join and MUST BE REJECTED
  console.log('Test 5: Member 3 ("Charlie") attempts to join full team "CyberKnights"');
  try {
    await simulateTeamLogin({ name: 'Charlie', teamName: 'CyberKnights' });
    assert.fail('Should have thrown 409 error');
  } catch (err) {
    assert.strictEqual(err.statusCode, 409);
    assert.match(err.message, /already full \(maximum 2 members: Alice, Bob\)/);
    console.log('✓ Passed: Charlie rejected with 409 error: ' + err.message);
  }

  // Test 6: Case insensitivity and whitespace handling
  console.log('Test 6: Case-insensitivity ("  bob  " and "  cyberknights  ")');
  const res4 = await simulateTeamLogin({ name: '  bob  ', teamName: '  cyberknights  ' });
  assert.strictEqual(res4.success, true);
  assert.deepStrictEqual(res4.team.members, ['Alice', 'Bob']);
  console.log('✓ Passed: Resumed session correctly regardless of case/whitespace');

  console.log('\nAll 2-Member Team tests passed successfully! 🚀');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
