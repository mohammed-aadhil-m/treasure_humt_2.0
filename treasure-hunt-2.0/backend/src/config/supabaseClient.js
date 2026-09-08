const { createClient } = require('@supabase/supabase-js');
const { createLocalClient } = require('./localDb');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isRealSupabase =
  url &&
  !url.includes('your-project') &&
  !url.includes('placeholder') &&
  key &&
  !key.includes('your-service-role') &&
  !key.includes('placeholder');

let supabase;

if (isRealSupabase) {
  console.log('[database] Connecting to Supabase at:', url);
  supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
} else {
  console.log(
    '[database] Running in LOCAL OFFLINE MODE (data saved to backend/data/local_db.json).\n' +
    'All features, 2-member teams, and QR hunt active without remote Supabase dependency.'
  );
  supabase = createLocalClient();
}

module.exports = { supabase };
