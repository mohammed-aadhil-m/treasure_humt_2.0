const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('./ApiError');
const { getEventSettings } = require('./eventSettings');
const { getTeamRank } = require('./leaderboard');

const TOTAL_ROUNDS = 5;
const FINISHED_MARKER = TOTAL_ROUNDS + 1; // 6

function elapsedSeconds(from, to) {
  if (!from) return 0;
  const end = to ? new Date(to) : new Date();
  return Math.max(0, Math.round((end - new Date(from)) / 1000));
}

// Never send correct_answer / accepted_answers to a participant.
function toSafeChallenge(challenge, attempts, maxAttempts) {
  return {
    id: challenge.id,
    code: challenge.code,
    type: challenge.type,
    question: challenge.question,
    options: challenge.options,
    imageUrl: challenge.image_url,
    attempts,
    maxAttempts: maxAttempts ?? null,
  };
}

function publicTeam(team) {
  return {
    id: team.id,
    teamCode: team.team_code,
    teamName: team.team_name,
    members: Array.isArray(team.members) ? team.members : [],
    status: team.status,
    currentRound: team.current_round,
    score: team.score,
  };
}

async function getRoundByNumber(roundNumber) {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('round_number', roundNumber)
    .maybeSingle();
  if (error || !data) throw new ApiError(500, `Round ${roundNumber} is not configured.`);
  return data;
}

async function getRoundById(roundId) {
  const { data, error } = await supabase.from('rounds').select('*').eq('id', roundId).maybeSingle();
  if (error || !data) throw new ApiError(500, 'Round not found.');
  return data;
}

async function getChallengeById(challengeId) {
  const { data, error } = await supabase.from('challenges').select('*').eq('id', challengeId).maybeSingle();
  if (error || !data) throw new ApiError(500, 'Challenge not found.');
  return data;
}

async function getTeamChallengeRow(teamId, roundId) {
  const { data, error } = await supabase
    .from('team_challenges')
    .select('*')
    .eq('team_id', teamId)
    .eq('round_id', roundId)
    .maybeSingle();
  if (error) throw new ApiError(500, 'Failed to load challenge assignment.');
  return data;
}

// Returns the team's assignment for this round, creating one if this is
// their first time entering it. Safe against concurrent double-submission:
// if two requests race to create the first assignment, the DB's unique
// index on (team_id, round_id) WHERE status='ASSIGNED' rejects the loser,
// which then simply re-reads the winner's row.
async function getOrAssignChallenge(teamId, roundId) {
  const existing = await getTeamChallengeRow(teamId, roundId);
  if (existing) {
    const challenge = await getChallengeById(existing.challenge_id);
    return { challenge, teamChallengeRow: existing };
  }

  const { data: pool, error: poolError } = await supabase
    .from('challenges')
    .select('*')
    .eq('round_id', roundId)
    .eq('is_active', true);
  if (poolError) throw new ApiError(500, 'Failed to load challenge pool.');
  if (!pool || pool.length === 0) {
    throw new ApiError(500, 'No active challenges configured for this round yet. Ask the organizer.');
  }

  const { data: alreadyAssignedRows, error: assignedError } = await supabase
    .from('team_challenges')
    .select('challenge_id')
    .eq('team_id', teamId);
  if (assignedError) throw new ApiError(500, 'Failed to check prior assignments.');

  const alreadyAssignedIds = new Set((alreadyAssignedRows || []).map((r) => r.challenge_id));
  let candidates = pool.filter((c) => !alreadyAssignedIds.has(c.id));
  if (candidates.length === 0) {
    // Defensive fallback only — should not happen in normal play, since a
    // team only ever needs one challenge per round.
    candidates = pool;
  }

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];

  const { data: inserted, error: insertError } = await supabase
    .from('team_challenges')
    .insert({
      team_id: teamId,
      challenge_id: chosen.id,
      round_id: roundId,
      status: 'ASSIGNED',
      attempts: 0,
    })
    .select('*')
    .single();

  if (insertError) {
    // Unique violation = another request already created the assignment
    // (race condition) or this exact pair already exists. Re-read instead
    // of failing the participant's request.
    const fallback = await getTeamChallengeRow(teamId, roundId);
    if (fallback) {
      const challenge = await getChallengeById(fallback.challenge_id);
      return { challenge, teamChallengeRow: fallback };
    }
    throw new ApiError(500, 'Failed to assign a challenge. Please try again.');
  }

  return { challenge: chosen, teamChallengeRow: inserted };
}

async function buildProgressArray(team) {
  const progress = [];
  for (let n = 1; n <= TOTAL_ROUNDS; n += 1) {
    let status = 'locked';
    if (n < team.current_round) {
      status = 'completed';
    } else if (n === team.current_round) {
      const round = await getRoundByNumber(n);
      const tc = await getTeamChallengeRow(team.id, round.id);
      status = tc && tc.status === 'COMPLETED' ? 'completed' : 'current';
    } else if (team.current_round >= FINISHED_MARKER) {
      status = 'completed';
    }
    progress.push({ round: n, status });
  }
  return progress;
}

// Builds the single source-of-truth state object the frontend polls after
// login. This is what makes refresh-safe, non-skippable behavior possible:
// the client never decides what screen to show on its own, it just renders
// whatever phase the server reports.
async function buildHuntState(team) {
  const settings = await getEventSettings();

  if (settings.status === 'PAUSED') {
    return { phase: 'PAUSED', eventName: settings.event_name, tagline: settings.tagline };
  }

  if (team.current_round === 0) {
    return { phase: 'NOT_STARTED', team: publicTeam(team), eventName: settings.event_name };
  }

  if (team.current_round >= FINISHED_MARKER || team.status === 'COMPLETED') {
    const rank = await getTeamRank(team.id);
    return {
      phase: 'COMPLETED',
      team: publicTeam(team),
      completionSeconds: elapsedSeconds(team.started_at, team.completed_at),
      rank,
    };
  }

  const round = await getRoundByNumber(team.current_round);
  const tc = await getTeamChallengeRow(team.id, round.id);

  if (!tc || tc.status !== 'COMPLETED') {
    const { challenge, teamChallengeRow } = await getOrAssignChallenge(team.id, round.id);
    return {
      phase: 'IN_CHALLENGE',
      roundNumber: round.round_number,
      roundName: round.name,
      challenge: toSafeChallenge(challenge, teamChallengeRow.attempts, round.max_attempts),
      progress: await buildProgressArray(team),
      elapsedSeconds: elapsedSeconds(team.started_at, new Date()),
      score: team.score,
      team: publicTeam(team),
    };
  }

  // Round's challenge is solved; team is holding a hint and must physically
  // find and scan the next QR checkpoint. We deliberately return only the
  // hint text here — never a QR location, URL, or checkpoint number.
  const challenge = await getChallengeById(tc.challenge_id);
  return {
    phase: 'AWAITING_NEXT_QR',
    roundNumber: round.round_number,
    hint: challenge.hint,
    progress: await buildProgressArray(team),
    elapsedSeconds: elapsedSeconds(team.started_at, new Date()),
    score: team.score,
    team: publicTeam(team),
  };
}

// Core state transition for both "scan QR #1 to start" and "scan QR #N to
// enter round N". Everything is verified server-side against the team's
// stored current_round — the client's belief about where it is never
// matters, only what the database says.
async function advanceViaCheckpoint(team, secureToken) {
  const settings = await getEventSettings();
  if (settings.status === 'PAUSED') {
    throw new ApiError(423, 'The treasure hunt is temporarily paused. Please wait for the organizer to resume.');
  }
  if (settings.status === 'ENDED') {
    throw new ApiError(423, 'This event has ended.');
  }

  const { data: checkpoint, error: cpError } = await supabase
    .from('qr_checkpoints')
    .select('*')
    .eq('secure_token', secureToken)
    .maybeSingle();

  if (cpError) throw new ApiError(500, 'QR lookup failed.');
  if (!checkpoint || !checkpoint.is_active) {
    throw new ApiError(404, 'This QR code is not active.');
  }

  const expectedCheckpoint = team.current_round + 1;

  if (checkpoint.checkpoint_number < expectedCheckpoint) {
    throw new ApiError(409, 'This checkpoint has already been completed.');
  }

  if (checkpoint.checkpoint_number > expectedCheckpoint) {
    throw new ApiError(423, 'Complete your current round before scanning this code.');
  }

  // If this round's challenge hasn't been solved yet, the team can't advance.
  if (team.current_round > 0) {
    const currentRoundRow = await getRoundByNumber(team.current_round);
    const tc = await getTeamChallengeRow(team.id, currentRoundRow.id);
    if (!tc || tc.status !== 'COMPLETED') {
      throw new ApiError(409, `Round ${team.current_round} is not completed yet.`);
    }
  }

  const nextRoundNumber = checkpoint.checkpoint_number;
  const nextRound = await getRoundByNumber(nextRoundNumber);

  const updates = {
    current_round: nextRoundNumber,
    last_activity_at: new Date().toISOString(),
  };
  if (nextRoundNumber === 1 && !team.started_at) {
    updates.started_at = new Date().toISOString();
    updates.status = 'IN_PROGRESS';
  }

  const { data: updatedTeam, error: updateError } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', team.id)
    .select('*')
    .single();
  if (updateError) throw new ApiError(500, 'Failed to update team progress.');

  // Ensure a team_progress row exists for this round (idempotent).
  await supabase
    .from('team_progress')
    .upsert(
      { team_id: team.id, round_id: nextRound.id, qr_checkpoint_id: checkpoint.id },
      { onConflict: 'team_id,round_id', ignoreDuplicates: true }
    );

  await supabase
    .from('qr_checkpoints')
    .update({ scan_count: checkpoint.scan_count + 1 })
    .eq('id', checkpoint.id);

  return buildHuntState(updatedTeam);
}

module.exports = {
  TOTAL_ROUNDS,
  FINISHED_MARKER,
  elapsedSeconds,
  toSafeChallenge,
  publicTeam,
  getRoundByNumber,
  getRoundById,
  getChallengeById,
  getTeamChallengeRow,
  getOrAssignChallenge,
  buildProgressArray,
  buildHuntState,
  advanceViaCheckpoint,
};
