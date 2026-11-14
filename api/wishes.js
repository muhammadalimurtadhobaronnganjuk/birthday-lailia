const wishesStore = require('../lib/wishesStore');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Read all wishes
  if (req.method === 'GET') {
    try {
      const wishes = await wishesStore.readWishes();
      return res.status(200).json(wishes);
    } catch (err) {
      console.error('[API Wishes] Error reading wishes:', err);
      return res.status(500).json({ error: 'Gagal mengambil data ucapan' });
    }
  }

  // POST: Add new wish
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const { name, message } = body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Nama pengirim harus diisi' });
      }

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Pesan ucapan tidak boleh kosong' });
      }

      const newWish = await wishesStore.addWish(name, message);
      return res.status(201).json(newWish);
    } catch (err) {
      console.error('[API Wishes] Error saving wish:', err);
      return res.status(500).json({ error: err.message || 'Gagal menyimpan ucapan' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
