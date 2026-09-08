// scripts/seedRiddles.js
require('dotenv').config();
const { supabase } = require('../src/config/supabaseClient');

const RIDDLES_DATA = [
  // ROUND 1:
  {
    roundNumber: 1,
    code: 'R1-001',
    type: 'riddle',
    question: 'I have no feet, but everyone passes through me.\nI stand at the beginning and end of your journey.',
    correctAnswer: 'Door',
    acceptedAnswers: ['door', 'the door', 'doors', 'main door', 'entrance door', 'front door'],
    hint: 'You walk through it every time you enter or leave the hall.',
    points: 100,
    penalty: 10,
  },
  {
    roundNumber: 1,
    code: 'R1-002',
    type: 'riddle',
    question: 'I have many legs, but I never walk.\nI carry you while you rest.',
    correctAnswer: 'Chair',
    acceptedAnswers: ['chair', 'the chair', 'a chair', 'chairs', 'seat', 'seats', 'bench'],
    hint: 'Take a seat and look right beneath you.',
    points: 100,
    penalty: 10,
  },
  {
    roundNumber: 1,
    code: 'R1-003',
    type: 'riddle',
    question: 'I am always under your feet,\nBut you rarely think about me.',
    correctAnswer: 'Floor',
    acceptedAnswers: ['floor', 'the floor', 'ground', 'the ground', 'flooring', 'tiles', 'carpet'],
    hint: 'Look directly down below your shoes.',
    points: 100,
    penalty: 10,
  },
  {
    roundNumber: 1,
    code: 'R1-004',
    type: 'puzzle',
    question: 'I have a handle, but I am not a door.\nYou use me to write your ideas.',
    correctAnswer: 'Pen',
    acceptedAnswers: ['pen', 'a pen', 'the pen', 'ballpoint pen', 'ink pen', 'pencil'],
    hint: 'Mightier than the sword and held in your fingers.',
    points: 100,
    penalty: 10,
  },
  {
    roundNumber: 1,
    code: 'R1-005',
    type: 'riddle',
    question: 'I have four legs and a flat top.\nMany things rest on me.',
    correctAnswer: 'Table',
    acceptedAnswers: ['table', 'the table', 'a table', 'desk', 'the desk', 'bench'],
    hint: 'Laptops, papers, and cups rest on its flat surface.',
    points: 100,
    penalty: 10,
  },
  {
    roundNumber: 1,
    code: 'R1-006',
    type: 'puzzle',
    question: 'I make things bright when darkness arrives.\nFind me where electricity becomes light.',
    correctAnswer: 'Switch',
    acceptedAnswers: ['switch', 'light switch', 'the switch', 'electric switch', 'button', 'switch board'],
    hint: 'You flip or toggle it on the wall to brighten the room.',
    points: 100,
    penalty: 10,
  },

  // ROUND 2:
  {
    roundNumber: 2,
    code: 'R2-001',
    type: 'riddle',
    question: 'I have no eyes, but I help everyone see.\nI turn small images into something big.',
    correctAnswer: 'Projector',
    acceptedAnswers: ['projector', 'the projector', 'a projector', 'overhead projector', 'video projector'],
    hint: 'Mounted near the ceiling, throwing light across the room.',
    points: 150,
    penalty: 10,
  },
  {
    roundNumber: 2,
    code: 'R2-002',
    type: 'riddle',
    question: 'I am not a wall, but I show what the projector wants you to see.\nEveryone looks at me.',
    correctAnswer: 'Screen',
    acceptedAnswers: ['screen', 'the screen', 'projector screen', 'display screen', 'white screen', 'projection screen'],
    hint: 'The giant white surface hanging at the front where videos play.',
    points: 150,
    penalty: 10,
  },
  {
    roundNumber: 2,
    code: 'R2-003',
    type: 'puzzle',
    question: 'I am small, but I can control a big screen.\nPress my buttons to change what you see.',
    correctAnswer: 'Remote',
    acceptedAnswers: ['remote', 'remote control', 'the remote', 'controller', 'remote controller'],
    hint: 'A handheld device with buttons for the projector or AC.',
    points: 150,
    penalty: 10,
  },
  {
    roundNumber: 2,
    code: 'R2-004',
    type: 'riddle',
    question: 'I have no voice, but I carry important announcements.\nFind the place where information is displayed.',
    correctAnswer: 'Notice Board',
    acceptedAnswers: ['notice board', 'noticeboard', 'the notice board', 'bulletin board', 'display board'],
    hint: 'Pinned with announcements, schedules, and circulars on the corridor wall.',
    points: 150,
    penalty: 10,
  },
  {
    roundNumber: 2,
    code: 'R2-005',
    type: 'riddle',
    question: 'I can see outside, but I cannot leave the room.\nOpen me and fresh air may enter.',
    correctAnswer: 'Window',
    acceptedAnswers: ['window', 'the window', 'windows', 'glass window', 'window pane'],
    hint: 'Look towards the outer walls with glass panes.',
    points: 150,
    penalty: 10,
  },
  {
    roundNumber: 2,
    code: 'R2-006',
    type: 'puzzle',
    question: 'I show you where you are going,\nBut I never move.',
    correctAnswer: 'Sign Board',
    acceptedAnswers: ['sign board', 'signboard', 'sign', 'the sign board', 'direction board', 'arrow board', 'name board'],
    hint: 'Fixed on walls or doors to guide visitors with arrows and titles.',
    points: 150,
    penalty: 10,
  },

  // ROUND 3:
  {
    roundNumber: 3,
    code: 'R3-001',
    type: 'riddle',
    question: "You cannot see me, but you can hear me.\nI make one person's voice reach everyone.",
    correctAnswer: 'Mic',
    acceptedAnswers: ['mic', 'microphone', 'the mic', 'the microphone', 'wireless mic', 'collar mic', 'mike'],
    hint: 'Placed on the podium or held in hand by the speaker.',
    points: 200,
    penalty: 15,
  },
  {
    roundNumber: 3,
    code: 'R3-002',
    type: 'riddle',
    question: 'I help turn a voice into sound that can reach the whole hall.\nFind where the sound comes from.',
    correctAnswer: 'Speaker',
    acceptedAnswers: ['speaker', 'speakers', 'the speaker', 'loudspeaker', 'loud speaker', 'sound box', 'sound system', 'audio speaker'],
    hint: 'Box mounted high on the walls pumping out sound.',
    points: 200,
    penalty: 15,
  },
  {
    roundNumber: 3,
    code: 'R3-003',
    type: 'riddle',
    question: 'I make the room comfortable without blowing wind with my hands.\nFind the machine that keeps you cool.',
    correctAnswer: 'AC',
    acceptedAnswers: ['ac', 'air conditioner', 'the ac', 'a/c', 'air conditioning', 'air cooler'],
    hint: 'Hangs high up on the wall blowing chilled air.',
    points: 200,
    penalty: 15,
  },
  {
    roundNumber: 3,
    code: 'R3-004',
    type: 'puzzle',
    question: 'I have many keys,\nBut I cannot open a door.\nI can create words with every touch.',
    correctAnswer: 'Keyboard',
    acceptedAnswers: ['keyboard', 'the keyboard', 'computer keyboard', 'key board', 'typing keyboard'],
    hint: 'Has spacebar, enter, and letters from A to Z.',
    points: 200,
    penalty: 15,
  },
  {
    roundNumber: 3,
    code: 'R3-005',
    type: 'puzzle',
    question: 'I have pages but I am not a book.\nI help you remember important dates.',
    correctAnswer: 'Calendar',
    acceptedAnswers: ['calendar', 'the calendar', 'a calendar', 'wall calendar', 'desk calendar'],
    hint: 'Shows the 12 months, weeks, and holidays of the year.',
    points: 200,
    penalty: 15,
  },
  {
    roundNumber: 3,
    code: 'R3-006',
    type: 'riddle',
    question: 'I keep your secrets inside,\nBut I am not a treasure chest.',
    correctAnswer: 'Cupboard',
    acceptedAnswers: ['cupboard', 'the cupboard', 'almirah', 'cabinet', 'closet', 'locker', 'wardrobe', 'storage cabinet'],
    hint: 'Furniture with wooden or steel doors storing folders and items.',
    points: 200,
    penalty: 15,
  },

  // ROUND 4:
  {
    roundNumber: 4,
    code: 'R4-001',
    type: 'riddle',
    question: 'I am not the stage, but I help you reach it.\nStep by step, I take you higher.',
    correctAnswer: 'Stage Steps',
    acceptedAnswers: ['stage steps', 'steps', 'stairs', 'stage stairs', 'the steps', 'the stairs', 'staircase'],
    hint: 'Climb these stairs to walk up to the podium.',
    points: 250,
    penalty: 15,
  },
  {
    roundNumber: 4,
    code: 'R4-002',
    type: 'riddle',
    question: 'I am where the speaker stands and everyone watches.\nPerformers love me.',
    correctAnswer: 'Stage',
    acceptedAnswers: ['stage', 'the stage', 'podium', 'dais', 'platform', 'main stage'],
    hint: 'The elevated wooden platform at the center front.',
    points: 250,
    penalty: 15,
  },
  {
    roundNumber: 4,
    code: 'R4-003',
    type: 'puzzle',
    question: 'You have climbed up, but now think about where people sit and watch the show.',
    correctAnswer: 'Chairs',
    acceptedAnswers: ['chairs', 'chair', 'seats', 'audience chairs', 'audience seats', 'the chairs', 'the seats', 'sofa'],
    hint: 'Look out from the stage towards the auditorium audience area.',
    points: 250,
    penalty: 15,
  },
  {
    roundNumber: 4,
    code: 'R4-004',
    type: 'riddle',
    question: 'I reflect your face,\nBut I never smile.',
    correctAnswer: 'Mirror',
    acceptedAnswers: ['mirror', 'a mirror', 'the mirror', 'looking glass', 'glass mirror'],
    hint: 'Shows your exact reflection.',
    points: 250,
    penalty: 15,
  },
  {
    roundNumber: 4,
    code: 'R4-005',
    type: 'riddle',
    question: "I am above you and chase away darkness.\nI don't need the Sun to shine.",
    correctAnswer: 'Light',
    acceptedAnswers: ['light', 'lights', 'the light', 'bulb', 'tube light', 'led', 'lamp', 'ceiling light', 'spotlight'],
    hint: 'Fixed to the ceiling, glowing brightly when switched on.',
    points: 250,
    penalty: 15,
  },
  {
    roundNumber: 4,
    code: 'R4-006',
    type: 'puzzle',
    question: 'I hold water but I am not a river.\nYou may find me when you need a drink.',
    correctAnswer: 'Water Dispenser',
    acceptedAnswers: ['water dispenser', 'water bottle', 'water cooler', 'dispenser', 'water filter', 'cooler', 'bottle', 'drinking water'],
    hint: 'Where thirsty participants go to refill cups or bottles.',
    points: 250,
    penalty: 15,
  },

  // ROUND 5:
  {
    roundNumber: 5,
    code: 'R5-001',
    type: 'riddle',
    question: 'I am filled with knowledge,\nYet I never speak.\nStudents often search through me.',
    correctAnswer: 'Library',
    acceptedAnswers: ['library', 'bookshelf', 'book shelf', 'bookcase', 'the library', 'reading room', 'book rack'],
    hint: 'A quiet room lined with bookshelves and academic lore.',
    points: 500,
    penalty: 20,
  },
  {
    roundNumber: 5,
    code: 'R5-002',
    type: 'puzzle',
    question: 'I am near the entrance,\nBut I am not the door.\nI welcome visitors without speaking.',
    correctAnswer: 'Reception Desk',
    acceptedAnswers: ['reception desk', 'reception', 'front desk', 'help desk', 'registration desk', 'helpdesk', 'inquiry desk'],
    hint: 'The very first desk where teams register and get badges.',
    points: 500,
    penalty: 20,
  },
  {
    roundNumber: 5,
    code: 'R5-003',
    type: 'riddle',
    question: 'I can be opened and closed,\nAnd I connect this hall with the outside world.',
    correctAnswer: 'Door',
    acceptedAnswers: ['door', 'exit door', 'main door', 'the door', 'hall door', 'emergency exit'],
    hint: 'Swing it open to step out into the campus breeze.',
    points: 500,
    penalty: 20,
  },
  {
    roundNumber: 5,
    code: 'R5-004',
    type: 'riddle',
    question: 'The final destination is almost here.\nLook where everyone comes to perform, speak and celebrate.',
    correctAnswer: 'Stage',
    acceptedAnswers: ['stage', 'the stage', 'podium', 'dais', 'platform', 'auditorium stage'],
    hint: 'Where the winners will be called and the championship trophy given.',
    points: 500,
    penalty: 20,
  },
  {
    roundNumber: 5,
    code: 'R5-005',
    type: 'puzzle',
    question: 'Congratulations! You solved every clue!\nYour treasure is waiting at the place where the hunt began.',
    correctAnswer: 'Starting Point',
    acceptedAnswers: ['starting point', 'start point', 'treasure', 'start', 'origin', 'the treasure', 'starting line', 'registration desk'],
    hint: 'Head back to where your journey first took flight.',
    points: 500,
    penalty: 20,
  },
  {
    roundNumber: 5,
    code: 'R5-006',
    type: 'puzzle',
    question: 'You searched high,\nYou searched low,\nYou followed every clue.\nNow return to the place\nwhere your adventure first began.\nYour treasure is waiting there!',
    correctAnswer: 'Treasure',
    acceptedAnswers: ['treasure', 'the treasure', 'starting point', 'start point', 'start', 'starting line', 'origin'],
    hint: 'The grand finale box at the starting hub.',
    points: 500,
    penalty: 20,
  },
];

async function seed() {
  console.log('[seeder] Loading rounds from database...');
  const { data: rounds, error: rErr } = await supabase.from('rounds').select('*').order('round_number', { ascending: true });
  if (rErr || !rounds || rounds.length === 0) {
    console.error('Failed to load rounds:', rErr);
    process.exit(1);
  }

  const roundMap = {};
  rounds.forEach((r) => {
    roundMap[r.round_number] = r.id;
  });

  console.log('[seeder] Removing old challenges (including old quiz questions)...');
  // First clean up any dependent team_challenges and answer_attempts
  await supabase.from('answer_attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('team_challenges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: delErr } = await supabase.from('challenges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) {
    console.warn('Warning during old challenges delete:', delErr.message);
  }

  console.log('[seeder] Inserting 30 new Riddles & Simple Puzzles across 5 rounds...');
  const payload = RIDDLES_DATA.map((item) => ({
    round_id: roundMap[item.roundNumber],
    code: item.code,
    type: item.type,
    question: item.question,
    options: null, // No options because no quizzes! All are riddle/puzzle
    correct_answer: item.correctAnswer,
    accepted_answers: item.acceptedAnswers,
    hint: item.hint,
    points: item.points,
    penalty: item.penalty,
    is_active: true,
  }));

  const { data: inserted, error: insErr } = await supabase.from('challenges').insert(payload).select('id, code, round_id, type');
  if (insErr) {
    console.error('Insert failed:', insErr);
    process.exit(1);
  }

  console.log(`[seeder] Successfully seeded ${inserted.length} challenges!`);
  console.log('Sample inserted:');
  inserted.slice(0, 5).forEach((c) => console.log(` - ${c.code} (${c.type})`));
  process.exit(0);
}

seed();
