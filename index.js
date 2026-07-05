import express from 'express';
import cors from 'cors';
import { getStreams } from './src/cache.js';
import { providers } from './src/providers.js';

const app = express();
app.use(cors());
app.use(express.json());

// ===== نقطة الجذر (الرئيسية) =====
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🐉 HydraStream is running',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      stats: '/api/stats',
      stream: '/api/stream?type=movie&id=tt1375666'
    }
  });
});

// ===== نقطة فحص الصحة =====
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'HydraStream',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ===== نقطة إحصائيات المصادر (الميزة الجديدة) =====
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    totalSources: providers.length,
    sources: providers.map(p => ({
      id: p.id,
      label: p.label,
      type: p.id.includes('tv') ? 'tv' : 'movie'
    })),
    timestamp: new Date().toISOString()
  });
});

// ===== نقطة جلب روابط البث (الرئيسية) =====
app.get('/api/stream', async (req, res) => {
  const startTime = Date.now();
  const { type, id, season, episode } = req.query;

  // التحقق من المدخلات
  if (!type || !id) {
    return res.status(400).json({
      success: false,
      error: 'type و id مطلوبان',
      example: '/api/stream?type=movie&id=tt1375666'
    });
  }

  if (type === 'tv' && (!season || !episode)) {
    return res.status(400).json({
      success: false,
      error: 'المسلسلات تحتاج season و episode',
      example: '/api/stream?type=tv&id=tt0944947&season=1&episode=1'
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
    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      params,
      total: sources.length,
      responseTime: `${responseTime}ms`,
      sources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ أثناء جلب المصادر'
    });
  }
});

// ===== معالج الروابط غير الموجودة (404) =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '🚫 الرابط غير موجود',
    available_endpoints: ['/api/health', '/api/stats', '/api/stream']
  });
});

// ===== تشغيل السيرفر =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ HydraStream running on port ${PORT}`);
  console.log(`📊 Stats: http://localhost:${PORT}/api/stats`);
  console.log(`🎬 Stream: http://localhost:${PORT}/api/stream?type=movie&id=tt1375666`);
});
