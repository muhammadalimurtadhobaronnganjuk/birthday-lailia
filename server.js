const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const WISHES_FILE = path.join(__dirname, 'wishes.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint for Render monitoring
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Helper to safely read wishes
async function readWishes() {
  try {
    if (!fs.existsSync(WISHES_FILE)) {
      await fs.promises.writeFile(WISHES_FILE, '[]', 'utf-8');
      return [];
    }
    const data = await fs.promises.readFile(WISHES_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading wishes file:', err);
    return [];
  }
}

// Helper to safely write wishes
async function writeWishes(wishes) {
  const tempFile = `${WISHES_FILE}.tmp`;
  await fs.promises.writeFile(tempFile, JSON.stringify(wishes, null, 2), 'utf-8');
  await fs.promises.rename(tempFile, WISHES_FILE);
}

// API Routes
// GET /api/wishes - Retrieve all wishes
app.get('/api/wishes', async (req, res) => {
  try {
    const wishes = await readWishes();
    res.json(wishes);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data ucapan' });
  }
});

// POST /api/wishes - Add new wish
app.post('/api/wishes', async (req, res) => {
  try {
    const { name, message } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Nama pengirim harus diisi' });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Pesan ucapan tidak boleh kosong' });
    }

    const cleanName = name.trim().slice(0, 50);
    const cleanMessage = message.trim().slice(0, 600);

    const wishes = await readWishes();

    const newWish = {
      id: Date.now().toString(),
      name: cleanName,
      message: cleanMessage,
      createdAt: new Date().toISOString()
    };

    // Prepend so the newest wishes appear first
    wishes.unshift(newWish);
    await writeWishes(wishes);

    res.status(201).json(newWish);
  } catch (err) {
    console.error('Error saving wish:', err);
    res.status(500).json({ error: 'Gagal menyimpan ucapan' });
  }
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server berjalan di: http://${HOST}:${PORT}`);
  console.log(`Endpoint API Wishes: http://${HOST}:${PORT}/api/wishes`);
});
