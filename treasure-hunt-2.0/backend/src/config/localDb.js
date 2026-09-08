const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'local_db.json');

const INITIAL_ROUNDS = [
  { id: '11111111-1111-4111-a111-111111111111', round_number: 1, name: 'Round 1', description: 'Easy — Riddle / Quiz / Puzzle', points: 100, max_attempts: null, wrong_answer_penalty: 10, is_active: true, created_at: new Date().toISOString() },
  { id: '22222222-2222-4222-a222-222222222222', round_number: 2, name: 'Round 2', description: 'Easy/Medium — Logic Puzzle / Riddle / Quiz', points: 150, max_attempts: null, wrong_answer_penalty: 10, is_active: true, created_at: new Date().toISOString() },
  { id: '33333333-3333-4333-a333-333333333333', round_number: 3, name: 'Round 3', description: 'Medium — Logic / Technical Quiz / Puzzle / Riddle', points: 200, max_attempts: null, wrong_answer_penalty: 15, is_active: true, created_at: new Date().toISOString() },
  { id: '44444444-4444-4444-a444-444444444444', round_number: 4, name: 'Round 4', description: 'Medium/Hard — Hard Puzzle / Riddle / Quiz', points: 250, max_attempts: null, wrong_answer_penalty: 15, is_active: true, created_at: new Date().toISOString() },
  { id: '55555555-5555-4555-a555-555555555555', round_number: 5, name: 'Round 5', description: 'Hard — Final Challenge', points: 500, max_attempts: null, wrong_answer_penalty: 20, is_active: true, created_at: new Date().toISOString() },
];

const INITIAL_CHECKPOINTS = [
  { id: 'cp1-uuid', checkpoint_number: 1, secure_token: 'token_cp1_start', internal_location: 'Starting point (publicly displayed on projector)', hint_note: 'Projector', is_active: true, scan_count: 0, created_at: new Date().toISOString() },
  { id: 'cp2-uuid', checkpoint_number: 2, secure_token: 'token_cp2_hidden', internal_location: 'Near the notice board / reading room', hint_note: 'Notice board', is_active: true, scan_count: 0, created_at: new Date().toISOString() },
  { id: 'cp3-uuid', checkpoint_number: 3, secure_token: 'token_cp3_hidden', internal_location: 'Library reading room', hint_note: 'Library shelf', is_active: true, scan_count: 0, created_at: new Date().toISOString() },
  { id: 'cp4-uuid', checkpoint_number: 4, secure_token: 'token_cp4_hidden', internal_location: 'Computer lab server rack', hint_note: 'Lab server rack', is_active: true, scan_count: 0, created_at: new Date().toISOString() },
  { id: 'cp5-uuid', checkpoint_number: 5, secure_token: 'token_cp5_hidden', internal_location: 'Sports scoreboard / trophy room', hint_note: 'Trophy cabinet', is_active: true, scan_count: 0, created_at: new Date().toISOString() },
];

const INITIAL_CHALLENGES = [
  {
    id: 'ch-101',
    round_id: INITIAL_ROUNDS[0].id,
    code: 'R1-001',
    type: 'riddle',
    question: 'I have keys but no locks. I have space but no room. You can enter, but you cannot go outside. What am I?',
    options: null,
    correct_answer: 'keyboard',
    accepted_answers: ['keyboard', 'a keyboard', 'the keyboard'],
    hint: 'Look where technology meets your fingertips.',
    points: 100,
    penalty: 10,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ch-102',
    round_id: INITIAL_ROUNDS[0].id,
    code: 'R1-002',
    type: 'quiz',
    question: 'Which data structure uses LIFO (Last In, First Out) order?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correct_answer: 'B',
    accepted_answers: [],
    hint: 'Where knowledge sleeps and ideas come alive... check the reading room.',
    points: 100,
    penalty: 10,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ch-201',
    round_id: INITIAL_ROUNDS[1].id,
    code: 'R2-001',
    type: 'riddle',
    question: 'The more you take, the more you leave behind. What am I?',
    options: null,
    correct_answer: 'footsteps',
    accepted_answers: ['footsteps', 'foot steps', 'steps'],
    hint: 'Where ideas are printed and pages turn, look near the notice board.',
    points: 150,
    penalty: 10,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ch-301',
    round_id: INITIAL_ROUNDS[2].id,
    code: 'R3-001',
    type: 'quiz',
    question: 'What is the time complexity of binary search on a sorted array?',
    options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
    correct_answer: 'C',
    accepted_answers: [],
    hint: 'Follow the hum of machines to where power is stored.',
    points: 200,
    penalty: 15,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ch-401',
    round_id: INITIAL_ROUNDS[3].id,
    code: 'R4-001',
    type: 'quiz',
    question: 'Which HTTP status code means "Unauthorized"?',
    options: ['400', '401', '403', '404'],
    correct_answer: 'B',
    accepted_answers: [],
    hint: 'Where champions are made and whistles blow, look near the scoreboard.',
    points: 250,
    penalty: 15,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ch-501',
    round_id: INITIAL_ROUNDS[4].id,
    code: 'R5-001',
    type: 'puzzle',
    question: 'A cipher shifts each letter forward by 3 (A→D, B→E...). Decode: "WUHDVXUH" (hint: it is one word).',
    options: null,
    correct_answer: 'treasure',
    accepted_answers: ['treasure', 'the treasure'],
    hint: 'The treasure lies where you first began.',
    points: 500,
    penalty: 20,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_SETTINGS = [
  {
    id: 1,
    event_name: 'TREASURE HUNT 2.0',
    tagline: 'SCAN. SOLVE. SEARCH. CONQUER.',
    event_date: '2026-09-09',
    total_rounds: 5,
    status: 'RUNNING',
    leaderboard_visible: true,
    default_max_attempts: null,
    wrong_answer_penalty: 10,
    hint_penalty: 0,
    updated_at: new Date().toISOString(),
  },
];

let memoryDb = null;
let lastMtimeMs = 0;

function loadDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      const stat = fs.statSync(DATA_FILE);
      if (!memoryDb || stat.mtimeMs > lastMtimeMs) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        memoryDb = JSON.parse(raw);
        lastMtimeMs = stat.mtimeMs;
      }
    }
  } catch (err) {
    console.warn('[localDb] Failed to read database file, initializing defaults:', err.message);
  }

  if (!memoryDb) {
    memoryDb = {
      event_settings: [...INITIAL_SETTINGS],
      rounds: [...INITIAL_ROUNDS],
      challenges: [...INITIAL_CHALLENGES],
      qr_checkpoints: [...INITIAL_CHECKPOINTS],
      teams: [],
      team_sessions: [],
      team_challenges: [],
      team_progress: [],
      answer_attempts: [],
      admins: [],
    };
    saveDb();
  }

  // Ensure default rows exist
  if (!memoryDb.event_settings || memoryDb.event_settings.length === 0) {
    memoryDb.event_settings = [...INITIAL_SETTINGS];
  }
  if (!memoryDb.rounds || memoryDb.rounds.length === 0) {
    memoryDb.rounds = [...INITIAL_ROUNDS];
  }
  if (!memoryDb.challenges || memoryDb.challenges.length === 0) {
    memoryDb.challenges = [...INITIAL_CHALLENGES];
  }
  if (!memoryDb.qr_checkpoints || memoryDb.qr_checkpoints.length === 0) {
    memoryDb.qr_checkpoints = [...INITIAL_CHECKPOINTS];
  }
  if (!memoryDb.admins || memoryDb.admins.length === 0) {
    const hash = bcrypt.hashSync('Admin@12345', 10);
    memoryDb.admins = [
      {
        id: 'admin-1',
        email: 'admin@treasurehunt.com',
        password_hash: hash,
        created_at: new Date().toISOString(),
      },
      {
        id: 'admin-2',
        email: 'admin@example.com',
        password_hash: hash,
        created_at: new Date().toISOString(),
      },
    ];
    saveDb();
  }
  return memoryDb;
}

function saveDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryDb, null, 2), 'utf8');
    if (fs.existsSync(DATA_FILE)) {
      lastMtimeMs = fs.statSync(DATA_FILE).mtimeMs;
    }
  } catch (err) {
    console.warn('[localDb] Failed to persist database file:', err.message);
  }
}

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.sortFields = [];
    this.limitCount = null;
    this.isSingle = false;
    this.isMaybeSingle = false;
    this.isCountOnly = false;
    this.operation = 'select';
    this.payload = null;
    this.upsertOptions = null;
  }

  select(columns, options) {
    if (options && options.count === 'exact' && options.head === true) {
      this.isCountOnly = true;
    }
    return this;
  }

  eq(field, value) {
    this.filters.push((row) => String(row[field]) === String(value));
    return this;
  }

  ilike(field, value) {
    const valStr = String(value ?? '').toLowerCase().replace(/%/g, '');
    this.filters.push((row) => String(row[field] ?? '').toLowerCase().includes(valStr));
    return this;
  }

  order(field, { ascending = true } = {}) {
    this.sortFields.push({ field, ascending });
    return this;
  }

  limit(n) {
    this.limitCount = n;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  insert(data) {
    this.operation = 'insert';
    this.payload = data;
    return this;
  }

  update(data) {
    this.operation = 'update';
    this.payload = data;
    return this;
  }

  upsert(data, options) {
    this.operation = 'upsert';
    this.payload = data;
    this.upsertOptions = options;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  _execute() {
    const db = loadDb();
    if (!db[this.table]) db[this.table] = [];
    const tableData = db[this.table];

    if (this.operation === 'insert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = [];
      for (const item of items) {
        const row = {
          id: item.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...item,
        };
        if (this.table === 'team_sessions' && !row.session_token) {
          row.session_token = crypto.randomBytes(24).toString('hex');
        }
        if (this.table === 'qr_checkpoints' && !row.secure_token) {
          row.secure_token = crypto.randomBytes(16).toString('hex');
        }
        if (this.table === 'team_challenges') {
          if (!row.status) row.status = 'ASSIGNED';
          if (row.attempts === undefined || row.attempts === null) row.attempts = 0;
        }
        tableData.push(row);
        inserted.push(row);
      }
      saveDb();
      const res = Array.isArray(this.payload) ? inserted : inserted[0];
      return { data: this.isSingle ? inserted[0] : res, error: null };
    }

    if (this.operation === 'update') {
      const updated = [];
      for (let i = 0; i < tableData.length; i++) {
        if (this.filters.every((f) => f(tableData[i]))) {
          tableData[i] = { ...tableData[i], ...this.payload };
          updated.push(tableData[i]);
        }
      }
      saveDb();
      return { data: this.isSingle ? updated[0] || null : updated, error: null };
    }

    if (this.operation === 'upsert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const conflictKey = this.upsertOptions?.onConflict || 'id';
      const conflictKeys = conflictKey.split(',').map((k) => k.trim());
      const upserted = [];

      for (const item of items) {
        const existingIdx = tableData.findIndex((row) =>
          conflictKeys.every((k) => String(row[k]) === String(item[k]))
        );
        if (existingIdx !== -1) {
          if (!this.upsertOptions?.ignoreDuplicates) {
            tableData[existingIdx] = { ...tableData[existingIdx], ...item };
          }
          upserted.push(tableData[existingIdx]);
        } else {
          const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...item };
          tableData.push(row);
          upserted.push(row);
        }
      }
      saveDb();
      return { data: upserted, error: null };
    }

    if (this.operation === 'delete') {
      const initialLen = tableData.length;
      db[this.table] = tableData.filter((row) => !this.filters.every((f) => f(row)));
      saveDb();
      return { data: null, error: null };
    }

    // Default: SELECT
    let result = tableData.filter((row) => this.filters.every((f) => f(row)));

    for (const { field, ascending } of this.sortFields) {
      result.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA === valB) return 0;
        if (valA == null) return ascending ? 1 : -1;
        if (valB == null) return ascending ? -1 : 1;
        if (valA < valB) return ascending ? -1 : 1;
        return ascending ? 1 : -1;
      });
    }

    if (this.limitCount != null) {
      result = result.slice(0, this.limitCount);
    }

    if (this.isCountOnly) {
      return { count: result.length, data: null, error: null };
    }

    // Expand joins if table is team_challenges or team_progress
    if (this.table === 'team_challenges') {
      result = result.map((row) => ({
        ...row,
        status: row.status || 'ASSIGNED',
        attempts: row.attempts ?? 0,
        challenges: db.challenges.find((c) => c.id === row.challenge_id) || null,
        rounds: db.rounds.find((r) => r.id === row.round_id) || null,
      }));
    } else if (this.table === 'challenges') {
      result = result.map((row) => ({
        ...row,
        rounds: db.rounds.find((r) => r.id === row.round_id) || null,
      }));
    } else if (this.table === 'team_progress') {
      result = result.map((row) => ({
        ...row,
        rounds: db.rounds.find((r) => r.id === row.round_id) || null,
        qr_checkpoints: db.qr_checkpoints.find((q) => q.id === row.qr_checkpoint_id) || null,
      }));
    }

    if (this.isSingle) {
      const item = result[0];
      if (!item) return { data: null, error: { message: 'Row not found', code: 'PGRST116' } };
      return { data: item, error: null };
    }

    if (this.isMaybeSingle) {
      return { data: result[0] || null, error: null };
    }

    return { data: result, error: null };
  }

  then(resolve, reject) {
    try {
      const res = this._execute();
      resolve(res);
    } catch (err) {
      reject(err);
    }
  }
}

function createLocalClient() {
  return {
    from(table) {
      return new QueryBuilder(table);
    },
  };
}

module.exports = { createLocalClient };
