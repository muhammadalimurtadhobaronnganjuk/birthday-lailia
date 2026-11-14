const express = require('express');
const cors = require('cors');
const path = require('path');
const wishesStore = require('./lib/wishesStore');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// API Routes
// GET /api/wishes - Retrieve all wishes
app.get(['/api/wishes', '/wishes'], async (req, res) => {
  try {
    const wishes = await wishesStore.readWishes();
    res.json(wishes);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data ucapan' });
  }
});

// POST /api/wishes - Add new wish
app.post(['/api/wishes', '/wishes'], async (req, res) => {
  try {
    const { name, message } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Nama pengirim harus diisi' });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Pesan ucapan tidak boleh kosong' });
    }

    const newWish = await wishesStore.addWish(name, message);
    res.status(201).json(newWish);
  } catch (err) {
    console.error('Error saving wish:', err);
    res.status(500).json({ error: err.message || 'Gagal menyimpan ucapan' });
  }
});

// Export app for Vercel serverless integration
module.exports = app;

// Only start standalone listener when run directly (e.g. npm start / node server.js)
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Server berjalan di: http://${HOST}:${PORT}`);
    console.log(`Endpoint API Wishes: http://${HOST}:${PORT}/api/wishes`);
  });
}
