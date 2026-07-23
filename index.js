// ================================================================
// 📦 ملف index.js - الخادم الرئيسي (محدث بالكامل)
// ================================================================

import express from 'express';
import cors from 'cors';
import { getStreams } from './src/cache.js';
import { missingContent } from './src/missingContent.js';

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// 📊 نقطة الصحة
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', service: 'HydraStream' });
});

// ============================================================
// 🎬 نقطة جلب المصادر (العادية + المفقودة)
// ============================================================
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

// ============================================================
// 📦 نقاط النهاية للمحتوى المفقود
// ============================================================

// دالة مساعدة للقراءة
const readMissingData = () => {
  return { cartoons: missingContent };
};

// جلب كل المحتوى المفقود من نوع معين
app.get('/api/missing/:type', (req, res) => {
  const { type } = req.params;
  const data = readMissingData();
  const filtered = data.cartoons.filter(item => item.type === type);
  if (filtered.length === 0) {
    return res.status(404).json({ error: `لا يوجد محتوى من نوع ${type}` });
  }
  res.json({ success: true, count: filtered.length, data: filtered });
});

// جلب محتوى مفقود معين بواسطة ID
app.get('/api/missing/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const data = readMissingData();
  const item = data.cartoons.find(c => c.id === id && c.type === type);
  if (!item) {
    return res.status(404).json({ error: 'المحتوى غير موجود' });
  }
  res.json({ success: true, data: item });
});

// جلب حلقة معينة من مسلسل مفقود
app.get('/api/missing/:type/:id/episode/:number', (req, res) => {
  const { type, id, number } = req.params;
  const data = readMissingData();
  const item = data.cartoons.find(c => c.id === id && c.type === type);
  if (!item) {
    return res.status(404).json({ error: 'المحتوى غير موجود' });
  }
  if (!item.episodes) {
    return res.status(404).json({ error: 'هذا المحتوى لا يحتوي على حلقات' });
  }
  const episode = item.episodes.find(e => e.number === parseInt(number));
  if (!episode) {
    return res.status(404).json({ error: 'الحلقة غير موجودة' });
  }
  res.json({ success: true, episode });
});

// ============================================================
// 🏠 نقطة الجذر
// ============================================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HydraStream is running',
    endpoints: {
      health: '/api/health',
      stream: '/api/stream?type=movie&id=tt1375666',
      missing: '/api/missing/tv/ana-wa-akhi-dubbed'
    }
  });
});

// ============================================================
// 🚀 تشغيل السيرفر
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ HydraStream running on port ${PORT}`);
  console.log(`📦 Missing content endpoints available at /api/missing/...`);
});
