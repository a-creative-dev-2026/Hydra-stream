import express from 'express';
import cors from 'cors';
import { getStreams } from './src/cache.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'HydraStream is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', service: 'HydraStream' });
});

app.get('/api/stream', async (req, res) => {
  const { type, id, season, episode } = req.query;

  if (!type || !id) {
    return res.status(400).json({
      success: false,
      error: 'type و id مطلوبان',
      example: '/api/stream?type=movie&id=tt1375666'
    });
  }

  const params = {
    type,
    id,
    season: season || '1',
    episode: episode || '1'
  };

  try {
    const sources = await getStreams(params);
    res.json({
      success: true,
      params,
      total: sources.length,
      sources
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
