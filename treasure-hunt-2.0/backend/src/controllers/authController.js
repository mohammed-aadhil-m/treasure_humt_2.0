const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { publicTeam } = require('../utils/huntFlow');

// POST /api/auth/team — entrance endpoint.
// Participants enter their Name and Team Name.
// - If the team doesn't exist: creates the team with this participant as Member 1.
// - If the team exists:
//     * If participant's name is already on the team: resumes their session.
//     * If team has < 2 members: adds participant as Member 2 (max 2 members).
//     * If team already has 2 members: rejects with 409 error (team is full).
// - Also supports legacy/admin { teamCode } lookup for backwards compatibility.
const teamLogin = asyncHandler(async (req, res) => {
  const { name, teamName, teamCode } = req.body;

  // 1. Participant Entrance via Name & Team Name
  if (teamName || name) {
    const participantName = typeof name === 'string' ? name.trim() : '';
    const requestedTeamName = typeof teamName === 'string' ? teamName.trim() : '';

    if (!participantName) {
      throw new ApiError(400, 'Please enter your name.');
    }
    if (!requestedTeamName) {
      throw new ApiError(400, 'Please enter your team name.');
    }
    if (participantName.length > 50) {
      throw new ApiError(400, 'Name cannot exceed 50 characters.');
    }
    if (requestedTeamName.length > 50) {
      throw new ApiError(400, 'Team name cannot exceed 50 characters.');
    }

    // Look up if a team with this name already exists (case-insensitive)
    const { data: existingTeam, error: lookupError } = await supabase
      .from('teams')
      .select('*')
      .ilike('team_name', requestedTeamName)
      .maybeSingle();

    if (lookupError) throw new ApiError(500, 'Team lookup failed.');

    let team;
    let isNew = false;
    let joinedExisting = false;

    if (!existingTeam) {
      // Create new team with Member 1
      const generatedCode =
        requestedTeamName
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .slice(0, 8) +
        '-' +
        Math.floor(1000 + Math.random() * 9000);

      const { data: newTeam, error: createError } = await supabase
        .from('teams')
        .insert({
          team_name: requestedTeamName,
          team_code: generatedCode,
          members: [participantName],
          status: 'REGISTERED',
          current_round: 0,
          score: 0,
        })
        .select('*')
        .single();

      if (createError) {
        // If unique collision occurred on team name in a race condition, try reading existing
        const { data: raceTeam } = await supabase
          .from('teams')
          .select('*')
          .ilike('team_name', requestedTeamName)
          .maybeSingle();
        if (raceTeam) {
          team = raceTeam;
        } else {
          throw new ApiError(500, 'Failed to register team. Please try again.');
        }
      } else {
        team = newTeam;
        isNew = true;
      }
    } else {
      team = existingTeam;
    }

    // If we joined an existing team (or race condition resolved to existing)
    if (!isNew) {
      const currentMembers = Array.isArray(team.members) ? team.members : [];
      const isAlreadyMember = currentMembers.some(
        (m) => m.trim().toLowerCase() === participantName.toLowerCase()
      );

      if (!isAlreadyMember) {
        // Enforce maximum 2 members per team
        if (currentMembers.length >= 2) {
          throw new ApiError(
            409,
            `Team "${team.team_name}" is already full (maximum 2 members: ${currentMembers.join(', ')}). Please choose a different team name.`
          );
        }

        // Add Member 2
        const updatedMembers = [...currentMembers, participantName];
        const { data: updatedTeam, error: updateError } = await supabase
          .from('teams')
          .update({
            members: updatedMembers,
            last_activity_at: new Date().toISOString(),
          })
          .eq('id', team.id)
          .select('*')
          .single();

        if (updateError) throw new ApiError(500, 'Failed to join team. Please try again.');
        team = updatedTeam;
        joinedExisting = true;
      }
    }

    // Create session token
    const { data: session, error: sessionError } = await supabase
      .from('team_sessions')
      .insert({ team_id: team.id })
      .select('session_token')
      .single();

    if (sessionError) throw new ApiError(500, 'Could not start a session. Please try again.');

    await supabase.from('teams').update({ last_activity_at: new Date().toISOString() }).eq('id', team.id);

    return res.json({
      success: true,
      sessionToken: session.session_token,
      team: publicTeam(team),
      memberName: participantName,
      isNewTeam: isNew,
      joinedExistingTeam: joinedExisting,
      message: isNew
        ? `Team "${team.team_name}" created! Welcome ${participantName} (Member 1/2). Your teammate can now join using this exact team name.`
        : joinedExisting
        ? `Successfully joined team "${team.team_name}" alongside ${team.members[0]}! (2/2 members)`
        : `Welcome back, ${participantName}! Resumed session for team "${team.team_name}".`,
    });
  }

  // 2. Legacy / Admin Fallback via Team ID / Code
  if (!teamCode || typeof teamCode !== 'string') {
    throw new ApiError(400, 'Please enter your Name and Team Name.');
  }

  const { data: team, error } = await supabase
    .from('teams')
    .select('*')
    .ilike('team_code', teamCode.trim())
    .maybeSingle();

  if (error) throw new ApiError(500, 'Team lookup failed.');
  if (!team) throw new ApiError(404, 'Team ID not recognized. Check with the organizer.');

  const { data: session, error: sessionError } = await supabase
    .from('team_sessions')
    .insert({ team_id: team.id })
    .select('session_token')
    .single();

  if (sessionError) throw new ApiError(500, 'Could not start a session. Please try again.');

  await supabase.from('teams').update({ last_activity_at: new Date().toISOString() }).eq('id', team.id);

  res.json({ success: true, sessionToken: session.session_token, team: publicTeam(team) });
});

module.exports = { teamLogin };
