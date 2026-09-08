const { supabase } = require('../config/supabaseClient');
const { ApiError } = require('./ApiError');

async function getEventSettings() {
  const { data, error } = await supabase.from('event_settings').select('*').eq('id', 1).maybeSingle();
  if (error || !data) throw new ApiError(500, 'Event settings not found. Did you run schema.sql?');
  return data;
}

module.exports = { getEventSettings };
