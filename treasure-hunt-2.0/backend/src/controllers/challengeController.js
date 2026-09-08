const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { isAnswerCorrect } = require('../utils/validators');
const { pointsForChallenge, penaltyForChallenge } = require('../utils/scoring');
const { getEventSettings } = require('../utils/eventSettings');
const {
  TOTAL_ROUNDS,
  FINISHED_MARKER,
  getRoundByNumber,
  getTeamChallengeRow,
  getChallengeById,
  buildHuntState,
} = require('../utils/huntFlow');

// GET /api/challenge/current — convenience alias. The full state (including
// the safe challenge payload) is also available via GET /api/hunt/current;
// this exists for clients that only care about the active challenge.
const getCurrentChallenge = asyncHandler(async (req, res) => {
  const state = await buildHuntState(req.team);
  if (state.phase !== 'IN_CHALLENGE') {
    throw new ApiError(409, 'No challenge is currently active for your team.');
  }
  res.json({ success: true, roundNumber: state.roundNumber, challenge: state.challenge });
});

// POST /api/challenge/answer — every correctness check, score change, and
// state transition happens here, server-side. The frontend only ever learns
// whether it was right or wrong and (on success) the hint text.
const submitAnswer = asyncHandler(async (req, res) => {
  const team = req.team;
  const { answer } = req.body;

  if (team.current_round === 0 || team.current_round >= FINISHED_MARKER) {
    throw new ApiError(409, 'There is no active round for your team right now.');
  }

  const settings = await getEventSettings();
  if (settings.status === 'PAUSED') {
    throw new ApiError(423, 'The treasure hunt is temporarily paused. Please wait for the organizer to resume.');
  }

  const round = await getRoundByNumber(team.current_round);
  const tc = await getTeamChallengeRow(team.id, round.id);

  if (!tc) throw new ApiError(409, 'No challenge assigned yet. Refresh and try again.');
  if (tc.status === 'COMPLETED') {
    throw new ApiError(409, 'You already solved this round. Go find the next QR code.');
  }
  if (round.max_attempts != null && tc.attempts >= round.max_attempts) {
    throw new ApiError(429, 'Maximum attempts reached for this round. Please contact the organizer.');
  }

  const challenge = await getChallengeById(tc.challenge_id);
  const correct = isAnswerCorrect(challenge, answer);
  const attemptNumber = tc.attempts + 1;

  if (correct) {
    const points = pointsForChallenge(challenge, round);
    const nowIso = new Date().toISOString();

    await supabase
      .from('team_challenges')
      .update({ status: 'COMPLETED', completed_at: nowIso, attempts: attemptNumber })
      .eq('id', tc.id);

    const { data: progressRow } = await supabase
      .from('team_progress')
      .select('*')
      .eq('team_id', team.id)
      .eq('round_id', round.id)
      .maybeSingle();

    const timeTaken = progressRow ? Math.round((new Date(nowIso) - new Date(progressRow.started_at)) / 1000) : null;

    await supabase
      .from('team_progress')
      .update({ completed_at: nowIso, score_earned: points, time_taken_seconds: timeTaken })
      .eq('team_id', team.id)
      .eq('round_id', round.id);

    const isFinalRound = round.round_number === TOTAL_ROUNDS;
    const teamUpdates = {
      score: team.score + points,
      last_activity_at: nowIso,
    };
    if (isFinalRound) {
      teamUpdates.status = 'COMPLETED';
      teamUpdates.completed_at = nowIso;
      teamUpdates.current_round = FINISHED_MARKER;
    }

    await supabase.from('teams').update(teamUpdates).eq('id', team.id);

    await supabase.from('answer_attempts').insert({
      team_id: team.id,
      challenge_id: challenge.id,
      answer: String(answer ?? ''),
      is_correct: true,
      attempt_number: attemptNumber,
      points_change: points,
    });

    const isFinalRound = round.round_number === TOTAL_ROUNDS;
    let nextHint = isFinalRound ? null : challenge.hint;
    if (!isFinalRound) {
      const nextCheckpointNumber = round.round_number + 1;
      const { data: nextCp } = await supabase
        .from('qr_checkpoints')
        .select('hint_note')
        .eq('checkpoint_number', nextCheckpointNumber)
        .maybeSingle();
      if (nextCp?.hint_note && nextCp.hint_note.trim()) {
        nextHint = nextCp.hint_note.trim();
      }
    }

    return res.json({
      success: true,
      correct: true,
      pointsEarned: points,
      finished: isFinalRound,
      hint: nextHint,
      message: isFinalRound ? 'Round 5 complete — the treasure is yours!' : 'Correct! Round complete.',
    });
  }

  const penalty = penaltyForChallenge(challenge, round, settings);
  const newScore = Math.max(0, team.score - penalty);

  await supabase.from('team_challenges').update({ attempts: attemptNumber }).eq('id', tc.id);
  await supabase
    .from('teams')
    .update({ score: newScore, last_activity_at: new Date().toISOString() })
    .eq('id', team.id);

  await supabase.from('answer_attempts').insert({
    team_id: team.id,
    challenge_id: challenge.id,
    answer: String(answer ?? ''),
    is_correct: false,
    attempt_number: attemptNumber,
    points_change: -penalty,
  });

  res.json({
    success: true,
    correct: false,
    pointsChange: -penalty,
    attempts: attemptNumber,
    maxAttempts: round.max_attempts,
    message: 'Not quite. Think again and try again.',
  });
});

module.exports = { getCurrentChallenge, submitAnswer };
