-- ============================================================
-- TREASURE HUNT 2.0 — 50 Campus Venue Riddles & Simple Puzzles
-- Exactly 10 questions per round across 5 rounds.
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

  -- ROUND 1 (10 Challenges — Easy / Basics)
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
Find me where electricity becomes light.', null, 'Switch', array['switch','light switch','the switch','electric switch','button','switch board'], 'You flip or toggle it on the wall to brighten the room.', 100, 10),
    (r1, 'R1-007', 'riddle', 'I have hands, but I cannot hold.
I have a face, but I cannot smile.
I never stop ticking.', null, 'Clock', array['clock','the clock','wall clock','watch','the wall clock','time'], 'Hangs high on the wall showing minutes and hours.', 100, 10),
    (r1, 'R1-008', 'puzzle', 'Feed me all your waste, wrappers, and paper.
I keep the room clean, but I am never full for long.', null, 'Dustbin', array['dustbin','the dustbin','trash can','garbage can','waste bin','bin','dust bin','trashcan'], 'Standing in the corner waiting for used wrappers and scrap.', 100, 10),
    (r1, 'R1-009', 'riddle', 'I cover what lets sunlight in,
I flutter when the breeze rolls by.
Pull me aside to see outside.', null, 'Curtain', array['curtain','curtains','the curtain','the curtains','window curtain','drapes'], 'Fabric hanging beside the window panes.', 100, 10),
    (r1, 'R1-010', 'puzzle', 'I speak on the board without making a sound.
The more I write, the shorter I get.', null, 'Marker', array['marker','whiteboard marker','the marker','chalk','board marker','pen'], 'Held by the professor writing notes on the whiteboard.', 100, 10)
  on conflict (code) do update set
    question = excluded.question,
    type = excluded.type,
    options = null,
    correct_answer = excluded.correct_answer,
    accepted_answers = excluded.accepted_answers,
    hint = excluded.hint;

  -- ROUND 2 (10 Challenges — Hall, Media & Display)
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
But I never move.', null, 'Sign Board', array['sign board','signboard','sign','the sign board','direction board','arrow board','name board'], 'Fixed on walls or doors to guide visitors with arrows and titles.', 150, 10),
    (r2, 'R2-007', 'puzzle', 'I have a tail or live on wireless air.
I have two ears you click, but I am not a real rodent.', null, 'Mouse', array['mouse','computer mouse','the mouse','wireless mouse','optical mouse'], 'Sits beside the laptop controlling the pointer on screen.', 150, 10),
    (r2, 'R2-008', 'riddle', 'I have holes in the wall waiting silently.
Plug your charger into me to bring your dead battery to life.', null, 'Socket', array['socket','plug','power socket','wall socket','plug point','switchboard','outlet','power point'], 'Where participants insert phone charging adapters.', 150, 10),
    (r2, 'R2-009', 'puzzle', 'I fit inside your pocket, small as a thumb.
Plug me into a port, and gigabytes of files appear.', null, 'Pen Drive', array['pen drive','pendrive','usb','flash drive','usb drive','thumb drive'], 'Pocket storage device plugged into USB ports.', 150, 10),
    (r2, 'R2-010', 'riddle', 'I never sleep, I never blink.
A silent eye mounted up high, watching over everyone.', null, 'CCTV', array['cctv','cctv camera','camera','security camera','the camera','surveillance camera'], 'Mounted in the corner of the ceiling for campus security.', 150, 10)
  on conflict (code) do update set
    question = excluded.question,
    type = excluded.type,
    options = null,
    correct_answer = excluded.correct_answer,
    accepted_answers = excluded.accepted_answers,
    hint = excluded.hint;

  -- ROUND 3 (10 Challenges — Sound, Comfort & Tech)
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
But I am not a treasure chest.', null, 'Cupboard', array['cupboard','the cupboard','almirah','cabinet','closet','locker','wardrobe','storage cabinet'], 'Furniture with wooden or steel doors storing folders and items.', 200, 15),
    (r3, 'R3-007', 'riddle', 'I spin in circles without getting dizzy.
I have three blades, but I never cut anything.', null, 'Fan', array['fan','ceiling fan','the fan','the ceiling fan'], 'Whirring high overhead on the ceiling circulating the breeze.', 200, 15),
    (r3, 'R3-008', 'puzzle', 'I wrap around your head or rest in your ears.
I bring music to your world without letting anyone else hear.', null, 'Headphones', array['headphones','earphones','headphone', 'earphone', 'airpods', 'headset', 'earbuds'], 'Plugged into phones or laptops for private listening.', 200, 15),
    (r3, 'R3-009', 'riddle', 'I have zips, pockets, and two straps.
I ride on your back carrying your books and laptop everywhere.', null, 'Bag', array['bag','backpack','college bag','school bag','the bag','the backpack'], 'Carried on the shoulders by every college student.', 200, 15),
    (r3, 'R3-010', 'puzzle', 'I have blinking lights and small antennas.
I connect you to the whole world without a single physical wire.', null, 'Router', array['router','wifi router','wi-fi router','the router','wifi','wi-fi','modem'], 'The box radiating campus wireless internet signals.', 200, 15)
  on conflict (code) do update set
    question = excluded.question,
    type = excluded.type,
    options = null,
    correct_answer = excluded.correct_answer,
    accepted_answers = excluded.accepted_answers,
    hint = excluded.hint;

  -- ROUND 4 (10 Challenges — Stage & Surroundings)
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
You may find me when you need a drink.', null, 'Water Dispenser', array['water dispenser','water bottle','water cooler','dispenser','water filter','cooler','bottle','drinking water'], 'Where thirsty participants go to refill cups or bottles.', 250, 15),
    (r4, 'R4-007', 'riddle', 'I stand proudly on the stage with a sloping top.
Speakers rest their notes and microphones on me.', null, 'Podium', array['podium','lectern','the podium','the lectern','speaker stand','dais'], 'The wooden standing desk at the center of the stage.', 250, 15),
    (r4, 'R4-008', 'puzzle', 'I hang around your neck on a ribbon.
I show your photo, name, and college to prove who you are.', null, 'ID Card', array['id card','id','identity card','badge','the id card','tag','id badge','lanyard'], 'Every participant wears one on a lanyard around their neck.', 250, 15),
    (r4, 'R4-009', 'riddle', 'I am bright red, filled with pressure, and wait silently on the wall.
In times of smoke and heat, I am your hero.', null, 'Fire Extinguisher', array['fire extinguisher','extinguisher','the fire extinguisher','red cylinder','fire cylinder'], 'Red safety canister mounted on the corridor walls.', 250, 15),
    (r4, 'R4-010', 'puzzle', 'I am smooth, shiny, and blank until you write.
But a single swipe of a duster erases all my thoughts.', null, 'Whiteboard', array['whiteboard','white board','the whiteboard','board','marker board'], 'Large white board at the front written on with dry-erase markers.', 250, 15)
  on conflict (code) do update set
    question = excluded.question,
    type = excluded.type,
    options = null,
    correct_answer = excluded.correct_answer,
    accepted_answers = excluded.accepted_answers,
    hint = excluded.hint;

  -- ROUND 5 (10 Challenges — Finale & Treasure)
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
Your treasure is waiting there!', null, 'Treasure', array['treasure','the treasure','starting point','start point','start','starting line','origin'], 'The grand finale box at the starting hub.', 500, 20),
    (r5, 'R5-007', 'riddle', 'I have handles like a pot, and shine like gold or silver.
Only the champions get to lift me high.', null, 'Trophy', array['trophy','the trophy','cup','the cup','medal','shield','award','championship trophy'], 'The gleaming golden cup waiting for the winning team.', 500, 20),
    (r5, 'R5-008', 'puzzle', 'I am made of paper, stamped with prestige and signed by leaders.
I prove that you competed and conquered.', null, 'Certificate', array['certificate','the certificate','award','diploma','participation certificate'], 'Printed document awarded to winners and participants.', 500, 20),
    (r5, 'R5-009', 'riddle', 'Open my clamshell body, awake my glowing brain.
I calculate in nanoseconds, running code for your symposium.', null, 'Laptop', array['laptop','computer','the laptop','pc','notebook','the computer'], 'Portable computing machine sitting on the coordinator desk.', 500, 20),
    (r5, 'R5-010', 'puzzle', 'You started as seekers,
You decoded the night,
You ran through each checkpoint,
With teamwork and might.
Name the golden prize
that crowns every champion!', null, 'Victory', array['victory','treasure','winner','champion','success','trophy','first place','the victory','the treasure'], 'What awaits the fastest team at the end of the treasure hunt.', 500, 20)
  on conflict (code) do update set
    question = excluded.question,
    type = excluded.type,
    options = null,
    correct_answer = excluded.correct_answer,
    accepted_answers = excluded.accepted_answers,
    hint = excluded.hint;

end $$;
