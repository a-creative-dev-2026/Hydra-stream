// 1. الاستيرادات (Imports)
import express from 'express';
import cors from 'cors';
import { getStreams } from './src/cache.js';
import { circuitBreaker } from './src/circuitBreaker.js';
import { healthMonitor } from './src/healthMonitor.js';
import { errorLogger } from './src/errorLogger.js';

// 2. إنشاء تطبيق Express (تعريف المتغير app)
const app = express();
app.use(cors());
app.use(express.json());

// 3. جميع نقاط النهاية (Routes) - ضعها هنا، بعد تعريف app
app.get('/', (req, res) => {
  res.json({ success: true, message: 'HydraStream is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', service: 'HydraStream' });
});

// نقطة حالة المصادر
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    stats: circuitBreaker.getStats(),
    cacheSize: memoryCache?.size || 0,
    uptime: process.uptime()
  });
});

// نقطة التحديث الصحي
app.post('/api/refresh', async (req, res) => {
  try {
    const results = await healthMonitor.checkAllSources();
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// نقطة إعادة تعيين Circuit Breaker
app.post('/api/reset-breaker', (req, res) => {
  circuitBreaker.resetAll();
  res.json({ success: true, message: 'تم إعادة تعيين جميع قواطع الدائرة' });
});

// نقطة عرض سجلات الأخطاء
app.get('/api/errors', (req, res) => {
  const stats = errorLogger.getErrorStats();
  res.json({ success: true, stats });
});

// نقطة جلب روابط البث
app.get('/api/stream', async (req, res) => {
  // ... (كود الـ stream الموجود لديك)
});

// 4. تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ HydraStream running on port ${PORT}`);
});

// 5. بدء مراقبة الصحة (يمكن وضعها هنا أو بعد تشغيل السيرفر)
healthMonitor.startMonitoring();
