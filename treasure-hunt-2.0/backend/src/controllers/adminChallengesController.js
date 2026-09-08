const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

const VALID_TYPES = ['quiz', 'riddle', 'puzzle', 'image_puzzle'];

// GET /api/admin/challenges?round=1
const listChallenges = asyncHandler(async (req, res) => {
  let query = supabase.from('challenges').select('*, rounds(round_number, name)').order('created_at', { ascending: true });

  if (req.query.round) {
    const { data: round } = await supabase
      .from('rounds')
      .select('id')
      .eq('round_number', Number(req.query.round))
      .maybeSingle();
    if (round) query = query.eq('round_id', round.id);
  }

  const { data, error } = await query;
  if (error) throw new ApiError(500, 'Failed to load challenges.');
  res.json({ success: true, challenges: data });
});

// POST /api/admin/challenges
const createChallenge = asyncHandler(async (req, res) => {
  const { roundNumber, code, type, question, options, correctAnswer, acceptedAnswers, hint, imageUrl, points, penalty } =
    req.body;

  if (!roundNumber || !type || !question || !correctAnswer || !hint) {
    throw new ApiError(400, 'roundNumber, type, question, correctAnswer, and hint are required.');
  }
  if (!VALID_TYPES.includes(type)) throw new ApiError(400, `type must be one of: ${VALID_TYPES.join(', ')}`);
  if (type === 'quiz' && (!Array.isArray(options) || options.length < 2)) {
    throw new ApiError(400, 'Quiz challenges need at least 2 options.');
  }

  const { data: round, error: roundError } = await supabase
    .from('rounds')
    .select('id')
    .eq('round_number', roundNumber)
    .maybeSingle();
  if (roundError || !round) throw new ApiError(400, 'Invalid roundNumber.');

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      round_id: round.id,
      code: code || null,
      type,
      question,
      options: type === 'quiz' ? options : null,
      correct_answer: correctAnswer,
      accepted_answers: acceptedAnswers ?? [],
      hint,
      image_url: imageUrl || null,
      points: points ?? null,
      penalty: penalty ?? null,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw new ApiError(409, 'A challenge with that code already exists.');
    throw new ApiError(500, 'Failed to create challenge.');
  }

  res.status(201).json({ success: true, challenge: data });
});

// PUT /api/admin/challenges/:id
const updateChallenge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, type, question, options, correctAnswer, acceptedAnswers, hint, imageUrl, points, penalty, isActive } =
    req.body;

  if (type && !VALID_TYPES.includes(type)) {
    throw new ApiError(400, `type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  const updates = {};
  if (code !== undefined) updates.code = code;
  if (type !== undefined) updates.type = type;
  if (question !== undefined) updates.question = question;
  if (options !== undefined) updates.options = options;
  if (correctAnswer !== undefined) updates.correct_answer = correctAnswer;
  if (acceptedAnswers !== undefined) updates.accepted_answers = acceptedAnswers;
  if (hint !== undefined) updates.hint = hint;
  if (imageUrl !== undefined) updates.image_url = imageUrl;
  if (points !== undefined) updates.points = points;
  if (penalty !== undefined) updates.penalty = penalty;
  if (isActive !== undefined) updates.is_active = isActive;

  const { data, error } = await supabase.from('challenges').update(updates).eq('id', id).select('*').single();
  if (error) throw new ApiError(500, 'Failed to update challenge.');

  res.json({ success: true, challenge: data });
});

// DELETE /api/admin/challenges/:id
const deleteChallenge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('challenges').delete().eq('id', id);
  if (error) throw new ApiError(500, 'Failed to delete challenge.');
  res.json({ success: true });
});

// GET /api/admin/rounds
const listRounds = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('rounds').select('*').order('round_number', { ascending: true });
  if (error) throw new ApiError(500, 'Failed to load rounds.');
  res.json({ success: true, rounds: data });
});

// PUT /api/admin/rounds/:id — configure per-round scoring, penalty, attempt cap.
const updateRound = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, points, maxAttempts, wrongAnswerPenalty, isActive } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (points !== undefined) updates.points = points;
  if (maxAttempts !== undefined) updates.max_attempts = maxAttempts;
  if (wrongAnswerPenalty !== undefined) updates.wrong_answer_penalty = wrongAnswerPenalty;
  if (isActive !== undefined) updates.is_active = isActive;

  const { data, error } = await supabase.from('rounds').update(updates).eq('id', id).select('*').single();
  if (error) throw new ApiError(500, 'Failed to update round.');

  res.json({ success: true, round: data });
});

module.exports = { listChallenges, createChallenge, updateChallenge, deleteChallenge, listRounds, updateRound };
