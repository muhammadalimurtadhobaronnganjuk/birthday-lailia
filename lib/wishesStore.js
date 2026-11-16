const fs = require('fs');
const path = require('path');
const os = require('os');

// Load environment variables if dotenv is available
try {
  require('dotenv').config();
} catch (e) {
  // Ignore in environments where dotenv is not loaded
}

// Supabase Client Integration
const { createClient } = require('@supabase/supabase-js');

// Helper to sanitize Supabase URL (strip accidental /rest/v1 or trailing slashes)
function sanitizeSupabaseUrl(rawUrl) {
  if (!rawUrl) return '';
  let clean = String(rawUrl).trim();
  clean = clean.replace(/\/rest\/v1\/?$/i, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

const rawSupabaseUrl = process.env.SUPABASE_URL;
const SUPABASE_URL = sanitizeSupabaseUrl(rawSupabaseUrl);
const SUPABASE_KEY = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('[wishesStore] Supabase client initialized successfully with URL:', SUPABASE_URL);
  } catch (err) {
    console.warn('[wishesStore] Failed to initialize Supabase client:', err.message);
  }
}

// Detect serverless environment (Vercel / AWS Lambda)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Seed file in the project root
const ROOT_WISHES_FILE = path.join(__dirname, '..', 'wishes.json');

// In serverless, only /tmp is writable; locally, use root wishes.json
const TARGET_WISHES_FILE = isServerless
  ? path.join(os.tmpdir(), 'wishes.json')
  : ROOT_WISHES_FILE;

// In-memory cache for fast response and serverless fallback
let inMemoryWishes = null;

// Initial default wish in case no file exists
const DEFAULT_WISHES = [
  {
    id: "1",
    name: "Ali",
    message: "Selamat ulang tahun cantik!",
    createdAt: "2026-11-14T13:21:00.678Z"
  }
];

async function getInitialWishes() {
  // Try reading from TARGET_WISHES_FILE first
  try {
    if (fs.existsSync(TARGET_WISHES_FILE)) {
      const data = await fs.promises.readFile(TARGET_WISHES_FILE, 'utf-8');
      const parsed = JSON.parse(data || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('[wishesStore] Warning reading TARGET_WISHES_FILE:', err.message);
  }

  // If TARGET_WISHES_FILE didn't have data, try reading root seed wishes.json
  try {
    if (fs.existsSync(ROOT_WISHES_FILE)) {
      const data = await fs.promises.readFile(ROOT_WISHES_FILE, 'utf-8');
      const parsed = JSON.parse(data || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('[wishesStore] Warning reading ROOT_WISHES_FILE:', err.message);
  }

  return [...DEFAULT_WISHES];
}

async function readWishes() {
  // 1. Try fetching from Supabase if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[wishesStore] Supabase read error, falling back to local storage:', error.message);
      } else if (Array.isArray(data)) {
        if (data.length === 0) {
          // If Supabase table is newly created and empty, return seed default wishes
          return [...DEFAULT_WISHES];
        }
        return data.map(row => ({
          id: String(row.id),
          name: row.name,
          message: row.message,
          createdAt: row.created_at || row.createdAt || new Date().toISOString()
        }));
      }
    } catch (err) {
      console.warn('[wishesStore] Supabase query exception:', err.message);
    }
  }

  // 2. Fallback to in-memory cache or local file
  if (inMemoryWishes !== null) {
    return inMemoryWishes;
  }

  inMemoryWishes = await getInitialWishes();
  return inMemoryWishes;
}

async function persistWishes(wishes) {
  try {
    const dir = path.dirname(TARGET_WISHES_FILE);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    const tempFile = `${TARGET_WISHES_FILE}.${Date.now()}.tmp`;
    await fs.promises.writeFile(tempFile, JSON.stringify(wishes, null, 2), 'utf-8');
    await fs.promises.rename(tempFile, TARGET_WISHES_FILE);
  } catch (err) {
    console.warn('[wishesStore] Warning persisting to disk:', err.message);
  }
}

async function addWish(name, message) {
  const cleanName = String(name || '').trim().slice(0, 50);
  const cleanMessage = String(message || '').trim().slice(0, 600);

  if (!cleanName) throw new Error('Nama pengirim harus diisi');
  if (!cleanMessage) throw new Error('Pesan ucapan tidak boleh kosong');

  const nowIso = new Date().toISOString();

  // 1. Try inserting to Supabase if configured
  if (supabase) {
    try {
      const newRecord = {
        name: cleanName,
        message: cleanMessage,
        created_at: nowIso
      };

      const { data, error } = await supabase
        .from('wishes')
        .insert([newRecord])
        .select()
        .single();

      if (error) {
        console.warn('[wishesStore] Supabase insert error, falling back to local:', error.message);
      } else if (data) {
        const savedWish = {
          id: String(data.id),
          name: data.name,
          message: data.message,
          createdAt: data.created_at || data.createdAt || nowIso
        };

        if (Array.isArray(inMemoryWishes)) {
          inMemoryWishes.unshift(savedWish);
        }

        return savedWish;
      }
    } catch (err) {
      console.warn('[wishesStore] Supabase insert exception:', err.message);
    }
  }

  // 2. Fallback to local / in-memory storage
  const wishes = await readWishes();

  const newWish = {
    id: Date.now().toString(),
    name: cleanName,
    message: cleanMessage,
    createdAt: nowIso
  };

  // Prepend newest wish
  wishes.unshift(newWish);
  inMemoryWishes = wishes;

  // Persist asynchronously in background
  persistWishes(wishes).catch(err => {
    console.warn('[wishesStore] Async persist error:', err.message);
  });

  return newWish;
}

module.exports = {
  readWishes,
  addWish,
  TARGET_WISHES_FILE,
  isServerless,
  isSupabaseConfigured: () => Boolean(supabase)
};
