// Resolves the point value for a correct answer: a per-challenge override
// wins over the round's default point value.
function pointsForChallenge(challenge, round) {
  return Number.isFinite(challenge.points) ? challenge.points : round.points;
}

// Resolves the penalty applied for a wrong answer: a per-challenge override
// wins over the round's default penalty, then the event-wide default.
function penaltyForChallenge(challenge, round, eventSettings) {
  if (Number.isFinite(challenge.penalty)) return challenge.penalty;
  if (Number.isFinite(round.wrong_answer_penalty)) return round.wrong_answer_penalty;
  return eventSettings.wrong_answer_penalty ?? 0;
}

module.exports = { pointsForChallenge, penaltyForChallenge };
