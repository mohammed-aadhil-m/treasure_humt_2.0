// Usage: npm run create-admin -- admin@example.com "a-strong-password"
// Creates (or updates the password of) an admin account. Run this locally
// after filling in backend/.env — never expose an admin signup route
// publicly.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabase } = require('../src/config/supabaseClient');

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: npm run create-admin -- <email> <password>');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { data: existing } = await supabase.from('admins').select('id').ilike('email', email).maybeSingle();

  if (existing) {
    const { error } = await supabase.from('admins').update({ password_hash }).eq('id', existing.id);
    if (error) throw error;
    console.log(`Updated password for existing admin: ${email}`);
  } else {
    const { error } = await supabase.from('admins').insert({ email, password_hash });
    if (error) throw error;
    console.log(`Created admin: ${email}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
