const fs = require('fs');
const path = require('path');
const os = require('os');

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
  if (inMemoryWishes !== null) {
    return inMemoryWishes;
  }

  inMemoryWishes = await getInitialWishes();
  return inMemoryWishes;
}

async function persistWishes(wishes) {
  try {
    // If running in serverless, ensure directory exists (usually /tmp already exists)
    const dir = path.dirname(TARGET_WISHES_FILE);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    const tempFile = `${TARGET_WISHES_FILE}.${Date.now()}.tmp`;
    await fs.promises.writeFile(tempFile, JSON.stringify(wishes, null, 2), 'utf-8');
    await fs.promises.rename(tempFile, TARGET_WISHES_FILE);
  } catch (err) {
    // If filesystem write fails in serverless, in-memory cache still holds the data
    console.warn('[wishesStore] Warning persisting to disk:', err.message);
  }
}

async function addWish(name, message) {
  const cleanName = String(name || '').trim().slice(0, 50);
  const cleanMessage = String(message || '').trim().slice(0, 600);

  if (!cleanName) throw new Error('Nama pengirim harus diisi');
  if (!cleanMessage) throw new Error('Pesan ucapan tidak boleh kosong');

  const wishes = await readWishes();

  const newWish = {
    id: Date.now().toString(),
    name: cleanName,
    message: cleanMessage,
    createdAt: new Date().toISOString()
  };

  // Prepend newest wish
  wishes.unshift(newWish);
  inMemoryWishes = wishes;

  // Persist asynchronously in background (don't block response if disk slow)
  persistWishes(wishes).catch(err => {
    console.warn('[wishesStore] Async persist error:', err.message);
  });

  return newWish;
}

module.exports = {
  readWishes,
  addWish,
  TARGET_WISHES_FILE,
  isServerless
};
