require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function check() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('Testing Supabase URL:', url);
  console.log('Service role key length:', key ? key.length : 0);

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tables = ['event_settings', 'rounds', 'challenges', 'qr_checkpoints', 'teams', 'admins'];
  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('*').limit(3);
      if (error) {
        console.log(`Table "${t}": ERROR -> ${error.message} (code: ${error.code})`);
      } else {
        console.log(`Table "${t}": OK (${data.length} rows found)`);
      }
    } catch (e) {
      console.log(`Table "${t}": EXCEPTION ->`, e.message);
    }
  }
}

check();
