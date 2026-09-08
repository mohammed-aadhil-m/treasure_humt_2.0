-- ============================================================
-- TREASURE HUNT 2.0 — 30 College Venue Riddles & Simple Puzzles
-- (Quiz removed — 100% riddle & puzzle clues)
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

  -- ROUND 1 (6 Challenges)
  insert into challenges (round_id, code, type, question, options, correct_answer, accepted_answers, hint, points, penalty)
  values
    (r1, 'R1-001', 'riddle', 'I have no feet, but everyone passes through me.
I stand at the beginning and end of your journey.', null, 'Door', array['door','the door','doors','main door','entrance door','front door'], 'You walk through it every time you enter or leave the hall.', 100, 10),
    (r1, 'R1-002', 'riddle', 'I have many legs, but I never walk.
I carry you while you rest.', null, 'Chair', array['chair','the chair','a chair','chairs','seat','seats','bench'], 'Take a seat and look right beneath you.', 100, 10),
    (r1, 'R1-003', 'riddle', 'I am always under your feet,
But you rarely think about me.', null, 'Floor', array['floor','the floor','ground','the ground','flooring','tiles','carpet'], 'Look directly down below your shoes.', 100, 10),
    (r1, 'R1-004', 'puzzle', 'I have a handle, but I am not a door.
You use me to write your ideas.', null, 'Pen', array['pen','a pen','the pen','ballpoint pen','ink pen','pencil'], 'Mightier than the sword and held in your fingers.', 100, 10),
    (r1, 'R1-005', 'riddle', 'I have four legs and a flat top.
Many things rest on me.', null, 'Table', array['table','the table','a table','desk','the desk','bench'], 'Laptops, papers, and cups rest on its flat surface.', 100, 10),
    (r1, 'R1-006', 'puzzle', 'I make things bright when darkness arrives.
Find me where electricity becomes light.', null, 'Switch', array['switch','light switch','the switch','electric switch','button','switch board'], 'You flip or toggle it on the wall to brighten the room.', 100, 10)
  on conflict (code) do update set
    question = excluded.question,
    type = excluded.type,
    options = null,
    correct_answer = excluded.correct_answer,
    accepted_answers = excluded.accepted_answers,
    hint = excluded.hint;

  -- ROUND 2 (6 Challenges)
  insert into challenges (round_id, code, type, question, options, correct_answer, accepted_answers, hint, points, penalty)
  values
    (r2, 'R2-001', 'riddle', 'I have no eyes, but I help everyone see.
I turn small images into something big.', null, 'Projector', array['projector','the projector','a projector','overhead projector','video projector'], 'Mounted near the ceiling, throwing light across the room.', 150, 10),
    (r2, 'R2-002', 'riddle', 'I am not a wall, but I show what the projector wants you to see.
Everyone looks at me.', null, 'Screen', array['screen','the screen','projector screen','display screen','white screen','projection screen'], 'The giant white surface hanging at the front where videos play.', 150, 10),
    (r2, 'R2-003', 'puzzle', 'I am small, but I can control a big screen.
Press my buttons to change what you see.', null, 'Remote', array['remote','remote control','the remote','controller','remote controller'], 'A handheld device with buttons for the projector or AC.', 150, 10),
    (r2, 'R2-004', 'riddle', 'I have no voice, but I carry important announcements.
Find the place where information is displayed.', null, 'Notice Board', array['notice board','noticeboard','the notice board','bulletin board','display board'], 'Pinned with announcements, schedules, and circulars on the corridor wall.', 150, 10),
    (r2, 'R2-005', 'riddle', 'I can see outside, but I cannot leave the room.
Open me and fresh air may enter.', null, 'Window', array['window','the window','windows','glass window','window pane'], 'Look towards the outer walls with glass panes.', 150, 10),
    (r2, 'R2-006', 'puzzle', 'I show you where you are going,
But I never move.', null, 'Sign Board', array['sign board','signboard','sign','the sign board','direction board','arrow board','name board'], 'Fixed on walls or doors to guide visitors with arrows and titles.', 150, 10)
  on conflict (code) do update set
    question = excluded.question,
    type = excluded.type,
    options = null,
    correct_answer = excluded.correct_answer,
    accepted_answers = excluded.accepted_answers,
    hint = excluded.hint;

  -- ROUND 3 (6 Challenges)
  insert into challenges (round_id, code, type, question, options, correct_answer, accepted_answers, hint, points, penalty)
  values
    (r3, 'R3-001', 'riddle', 'You cannot see me, but you can hear me.
I make one person''s voice reach everyone.', null, 'Mic', array['mic','microphone','the mic','the microphone','wireless mic','collar mic','mike'], 'Placed on the podium or held in hand by the speaker.', 200, 15),
    (r3, 'R3-002', 'riddle', 'I help turn a voice into sound that can reach the whole hall.
Find where the sound comes from.', null, 'Speaker', array['speaker','speakers','the speaker','loudspeaker','loud speaker','sound box','sound system','audio speaker'], 'Box mounted high on the walls pumping out sound.', 200, 15),
    (r3, 'R3-003', 'riddle', 'I make the room comfortable without blowing wind with my hands.
Find the machine that keeps you cool.', null, 'AC', array['ac','air conditioner','the ac','a/c','air conditioning','air cooler'], 'Hangs high up on the wall blowing chilled air.', 200, 15),
    (r3, 'R3-004', 'puzzle', 'I have many keys,
But I cannot open a door.
I can create words with every touch.', null, 'Keyboard', array['keyboard','the keyboard','computer keyboard','key board','typing keyboard'], 'Has spacebar, enter, and letters from A to Z.', 200, 15),
    (r3, 'R3-005', 'puzzle', 'I have pages but I am not a book.
I help you remember important dates.', null, 'Calendar', array['calendar','the calendar','a calendar','wall calendar','desk calendar'], 'Shows the 12 months, weeks, and holidays of the year.', 200, 15),
    (r3, 'R3-006', 'riddle', 'I keep your secrets inside,
But I am not a treasure chest.', null, 'Cupboard', array['cupboard','the cupboard','almirah','cabinet','closet','locker','wardrobe','storage cabinet'], 'Furniture with wooden or steel doors storing folders and items.', 200, 15)
  on conflict (code) do update set
    question = excluded.question,
    type = excluded.type,
    options = null,
    correct_answer = excluded.correct_answer,
    accepted_answers = excluded.accepted_answers,
    hint = excluded.hint;

  -- ROUND 4 (6 Challenges)
  insert into challenges (round_id, code, type, question, options, correct_answer, accepted_answers, hint, points, penalty)
  values
    (r4, 'R4-001', 'riddle', 'I am not the stage, but I help you reach it.
Step by step, I take you higher.', null, 'Stage Steps', array['stage steps','steps','stairs','stage stairs','the steps','the stairs','staircase'], 'Climb these stairs to walk up to the podium.', 250, 15),
    (r4, 'R4-002', 'riddle', 'I am where the speaker stands and everyone watches.
Performers love me.', null, 'Stage', array['stage','the stage','podium','dais','platform','main stage'], 'The elevated wooden platform at the center front.', 250, 15),
    (r4, 'R4-003', 'puzzle', 'You have climbed up, but now think about where people sit and watch the show.', null, 'Chairs', array['chairs','chair','seats','audience chairs','audience seats','the chairs','the seats','sofa'], 'Look out from the stage towards the auditorium audience area.', 250, 15),
    (r4, 'R4-004', 'riddle', 'I reflect your face,
But I never smile.', null, 'Mirror', array['mirror','a mirror','the mirror','looking glass','glass mirror'], 'Shows your exact reflection.', 250, 15),
    (r4, 'R4-005', 'riddle', 'I am above you and chase away darkness.
I don''t need the Sun to shine.', null, 'Light', array['light','lights','the light','bulb','tube light','led','lamp','ceiling light','spotlight'], 'Fixed to the ceiling, glowing brightly when switched on.', 250, 15),
    (r4, 'R4-006', 'puzzle', 'I hold water but I am not a river.
You may find me when you need a drink.', null, 'Water Dispenser', array['water dispenser','water bottle','water cooler','dispenser','water filter','cooler','bottle','drinking water'], 'Where thirsty participants go to refill cups or bottles.', 250, 15)
  on conflict (code) do update set
    question = excluded.question,
    type = excluded.type,
    options = null,
    correct_answer = excluded.correct_answer,
    accepted_answers = excluded.accepted_answers,
    hint = excluded.hint;

  -- ROUND 5 (6 Challenges)
  insert into challenges (round_id, code, type, question, options, correct_answer, accepted_answers, hint, points, penalty)
  values
    (r5, 'R5-001', 'riddle', 'I am filled with knowledge,
Yet I never speak.
Students often search through me.', null, 'Library', array['library','bookshelf','book shelf','bookcase','the library','reading room','book rack'], 'A quiet room lined with bookshelves and academic lore.', 500, 20),
    (r5, 'R5-002', 'puzzle', 'I am near the entrance,
But I am not the door.
I welcome visitors without speaking.', null, 'Reception Desk', array['reception desk','reception','front desk','help desk','registration desk','helpdesk','inquiry desk'], 'The very first desk where teams register and get badges.', 500, 20),
    (r5, 'R5-003', 'riddle', 'I can be opened and closed,
And I connect this hall with the outside world.', null, 'Door', array['door','exit door','main door','the door','hall door','emergency exit'], 'Swing it open to step out into the campus breeze.', 500, 20),
    (r5, 'R5-004', 'riddle', 'The final destination is almost here.
Look where everyone comes to perform, speak and celebrate.', null, 'Stage', array['stage','the stage','podium','dais','platform','auditorium stage'], 'Where the winners will be called and the championship trophy given.', 500, 20),
    (r5, 'R5-005', 'puzzle', 'Congratulations! You solved every clue!
Your treasure is waiting at the place where the hunt began.', null, 'Starting Point', array['starting point','start point','treasure','start','origin','the treasure','starting line','registration desk'], 'Head back to where your journey first took flight.', 500, 20),
    (r5, 'R5-006', 'puzzle', 'You searched high,
You searched low,
You followed every clue.
Now return to the place
where your adventure first began.
Your treasure is waiting there!', null, 'Treasure', array['treasure','the treasure','starting point','start point','start','starting line','origin'], 'The grand finale box at the starting hub.', 500, 20)
  on conflict (code) do update set
    question = excluded.question,
    type = excluded.type,
    options = null,
    correct_answer = excluded.correct_answer,
    accepted_answers = excluded.accepted_answers,
    hint = excluded.hint;

end $$;
