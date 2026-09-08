// Normalizes a text answer for comparison: trims, lowercases, and collapses
// internal whitespace so "  The  Keyboard " matches "the keyboard".
function normalizeAnswer(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function isAnswerCorrect(challenge, submitted) {
  const normalizedSubmitted = normalizeAnswer(submitted);

  if (challenge.type === 'quiz') {
    if (normalizeAnswer(challenge.correct_answer) === normalizedSubmitted) {
      return true;
    }
    // Also allow matching the option text directly
    if (Array.isArray(challenge.options)) {
      const correctIdx = String(challenge.correct_answer).trim().toUpperCase().charCodeAt(0) - 65;
      if (correctIdx >= 0 && correctIdx < challenge.options.length) {
        if (normalizeAnswer(challenge.options[correctIdx]) === normalizedSubmitted) {
          return true;
        }
      }
    }
    return (challenge.accepted_answers || []).some((c) => normalizeAnswer(c) === normalizedSubmitted);
  }

  const candidates = [challenge.correct_answer, ...(challenge.accepted_answers || [])];
  return candidates.some((c) => normalizeAnswer(c) === normalizedSubmitted);
}

module.exports = { normalizeAnswer, isAnswerCorrect };
