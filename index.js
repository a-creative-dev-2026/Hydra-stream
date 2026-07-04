import express from 'express';
import cors from 'cors';
import { getStreams } from './src/cache.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/stream', async (req, res) => {
  const { type, id, season, episode } = req.query;

  if (!type || !id) {
    return res.status(400).json({ error: 'type و id مطلوبان' });
  }

  const params = {
    type,
    id,
    season: season || '1',
    episode: episode || '1'
  };

  try {
    const sources = await getStreams(params);
    res.json({ success: true, params, total: sources.length, sources });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: '✅ HydraStream يعمل' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 شغال على المنفذ ${PORT}`);
});
