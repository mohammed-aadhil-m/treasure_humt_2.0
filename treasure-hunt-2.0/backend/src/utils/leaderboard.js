const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('./ApiError');

// Ranking rule (deterministic, per spec section 11):
//   1. Completion status — finished teams always outrank in-progress teams
//   2. Total score, descending
//   3. Completion time (finished teams only), ascending — faster wins ties
//   For in-progress teams (tiebreak beyond score): further along (higher
//   current_round) ranks above a team with the same score but less progress.
function compareTeams(a, b) {
  const aDone = a.status === 'COMPLETED';
  const bDone = b.status === 'COMPLETED';
  if (aDone !== bDone) return aDone ? -1 : 1;

  if (b.score !== a.score) return b.score - a.score;

  if (aDone && bDone) {
    const aTime = new Date(a.completed_at) - new Date(a.started_at);
    const bTime = new Date(b.completed_at) - new Date(b.started_at);
    return aTime - bTime;
  }

  return b.current_round - a.current_round;
}

async function getRankedTeams() {
  const { data, error } = await supabase.from('teams').select('*');
  if (error) throw new ApiError(500, 'Failed to load leaderboard.');

  return [...data].sort(compareTeams);
}

function toLeaderboardRow(team, index) {
  const completionSeconds =
    team.status === 'COMPLETED' && team.started_at && team.completed_at
      ? Math.round((new Date(team.completed_at) - new Date(team.started_at)) / 1000)
      : null;

  return {
    rank: index + 1,
    teamId: team.id,
    teamCode: team.team_code,
    teamName: team.team_name,
    members: Array.isArray(team.members) ? team.members : [],
    score: team.score,
    currentRound: team.current_round,
    status: team.status,
    completionSeconds,
  };
}

async function getTeamRank(teamId) {
  const ranked = await getRankedTeams();
  const index = ranked.findIndex((t) => t.id === teamId);
  return index === -1 ? null : index + 1;
}

module.exports = { getRankedTeams, toLeaderboardRow, getTeamRank };
