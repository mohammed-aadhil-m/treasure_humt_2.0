-- ============================================================
-- TREASURE HUNT 2.0 — Sample seed data
-- Run AFTER schema.sql. Safe to re-run (uses ON CONFLICT where possible).
-- Replace/extend with your own challenges from the Admin Panel later.
-- ============================================================

do $$
declare
  r1 uuid; r2 uuid; r3 uuid; r4 uuid; r5 uuid;
begin
  select id into r1 from rounds where round_number = 1;
  select id into r2 from rounds where round_number = 2;
  select id into r3 from rounds where round_number = 3;
  select id into r4 from rounds where round_number = 4;
  select id into r5 from rounds where round_number = 5;

  -- ROUND 1 — Easy (mix of riddle/quiz/puzzle) — need 2+ so teams can get different ones
  insert into challenges (round_id, code, type, question, options, correct_answer, accepted_answers, hint, points)
  values
    (r1, 'R1-001', 'riddle', 'I have keys but no locks. I have space but no room. You can enter, but you cannot go outside. What am I?', null, 'keyboard', array['keyboard','a keyboard','the keyboard'], 'Look where technology meets your fingertips.', 100),
    (r1, 'R1-002', 'quiz', 'Which data structure uses LIFO (Last In, First Out) order?', '["Queue","Stack","Array","Linked List"]', 'B', array[]::text[], 'Where knowledge sleeps and ideas come alive... check the reading room.', 100),
    (r1, 'R1-003', 'puzzle', 'What comes next in the sequence: 2, 6, 12, 20, 30, ?', null, '42', array[]::text[], 'Where knowledge sleeps and ideas come alive... check the reading room.', 100)
  on conflict (code) do nothing;

  -- ROUND 2 — Easy/Medium (logic puzzle / riddle / quiz)
  insert into challenges (round_id, code, type, question, options, correct_answer, accepted_answers, hint, points)
  values
    (r2, 'R2-001', 'riddle', 'The more you take, the more you leave behind. What am I?', null, 'footsteps', array['footsteps','foot steps','steps'], 'Where ideas are printed and pages turn, look near the notice board.', 150),
    (r2, 'R2-002', 'quiz', 'In networking, what does DNS stand for?', '["Domain Name System","Data Network Service","Digital Name Server","Domain Network Setup"]', 'A', array[]::text[], 'Where ideas are printed and pages turn, look near the notice board.', 150),
    (r2, 'R2-003', 'puzzle', 'A farmer has 17 sheep. All but 9 die. How many are left?', null, '9', array[]::text[], 'Where ideas are printed and pages turn, look near the notice board.', 150)
  on conflict (code) do nothing;

  -- ROUND 3 — Medium (logic / technical quiz / puzzle / riddle)
  insert into challenges (round_id, code, type, question, options, correct_answer, accepted_answers, hint, points)
  values
    (r3, 'R3-001', 'quiz', 'What is the time complexity of binary search on a sorted array?', '["O(n)","O(n log n)","O(log n)","O(1)"]', 'C', array[]::text[], 'Follow the hum of machines to where power is stored.', 200),
    (r3, 'R3-002', 'riddle', 'I am not alive, but I grow; I do not have lungs, but I need air; I do not have a mouth, but water kills me. What am I?', null, 'fire', array['fire','a fire'], 'Follow the hum of machines to where power is stored.', 200),
    (r3, 'R3-003', 'puzzle', 'Rearrange the letters of "LISTEN" to form another common English word.', null, 'silent', array['silent','the silent'], 'Follow the hum of machines to where power is stored.', 200)
  on conflict (code) do nothing;

  -- ROUND 4 — Medium/Hard (hard puzzle / riddle / quiz)
  insert into challenges (round_id, code, type, question, options, correct_answer, accepted_answers, hint, points)
  values
    (r4, 'R4-001', 'quiz', 'Which HTTP status code means "Unauthorized"?', '["400","401","403","404"]', 'B', array[]::text[], 'Where champions are made and whistles blow, look near the scoreboard.', 250),
    (r4, 'R4-002', 'riddle', 'What has a heart that does not beat?', null, 'artichoke', array['artichoke','an artichoke'], 'Where champions are made and whistles blow, look near the scoreboard.', 250)
  on conflict (code) do nothing;

  -- ROUND 5 — Hard (final challenge)
  insert into challenges (round_id, code, type, question, options, correct_answer, accepted_answers, hint, points)
  values
    (r5, 'R5-001', 'puzzle', 'A cipher shifts each letter forward by 3 (A→D, B→E...). Decode: "WUHDVXUH" (hint: it is one word).', null, 'treasure', array['treasure','the treasure'], 'The treasure lies where you first began.', 500)
  on conflict (code) do nothing;
end $$;

-- Sample teams for testing (team_code is what participants type in to start)
insert into teams (team_code, team_name, members)
values
  ('ALPHA01', 'Team Alpha', array['Aadhil','Kumar']),
  ('OMEGA02', 'Team Omega', array['Divya','Ravi']),
  ('TITAN03', 'Team Titans', array['Meera','Sanjay'])
on conflict (team_code) do nothing;
