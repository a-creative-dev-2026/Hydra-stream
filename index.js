import express from 'express';
import cors from 'cors';
import { getStreams, refreshCache } from './src/cache.js';

const app = express();
app.use(cors());
app.use(express.json());

// ✅ نقطة جلب روابط البث
app.get('/api/stream', async (req, res) => {
  const { type, id, season, episode } = req.query;

  if (!type || !id) {
    return res.status(400).json({
      error: 'نقص في البيانات',
      required: 'type (movie/tv) و id (مثل tt1375666)',
      example_movie: '/api/stream?type=movie&id=tt1375666',
      example_tv: '/api/stream?type=tv&id=tt0944947&season=1&episode=1'
    });
  }
  if (type === 'tv' && (!season || !episode)) {
    return res.status(400).json({ error: 'المسلسلات تحتاج season و episode' });
  }

  const params = { type, id, season: season || '1', episode: episode || '1' };

  try {
    const sources = await getStreams(params);
    const workingCount = sources.filter(s => s.status === '✅ يعمل').length;

    res.json({
      success: true,
      params,
      total_sources: sources.length,
      working_sources: workingCount,
      sources
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔄 إعادة تحميل يدوي
app.post('/api/refresh', async (req, res) => {
  const { type, id, season, episode } = req.body;
  if (!type || !id) {
    return res.status(400).json({ error: 'type و id مطلوبان' });
  }
  const params = { type, id, season: season || '1', episode: episode || '1' };
  const sources = await refreshCache(params);
  res.json({ success: true, message: 'تم التحديث القسري', count: sources.length });
});

// 🏥 فحص صحة السيرفر
app.get('/api/health', (req, res) => {
  res.json({ status: '🐉 HydraStream حي يقظ', uptime: process.uptime() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🐉 HydraStream شغال على http://localhost:${PORT}`);
  console.log(`📌 مثال فيلم: /api/stream?type=movie&id=tt1375666`);
  console.log(`📌 مثال مسلسل: /api/stream?type=tv&id=tt0944947&season=1&episode=1`);
  console.log(`📌 تحديث قسري: POST /api/refresh مع json\n`);
});
