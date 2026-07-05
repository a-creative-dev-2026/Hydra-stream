// أضف هذه الاستيرادات في الأعلى
import { circuitBreaker } from './src/circuitBreaker.js';
import { healthMonitor } from './src/healthMonitor.js';
import { errorLogger } from './src/errorLogger.js';

// نقطة لعرض حالة المصادر
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    stats: circuitBreaker.getStats(),
    cacheSize: memoryCache?.size || 0,
    uptime: process.uptime()
  });
});

// نقطة لتحديث صحي
app.post('/api/refresh', async (req, res) => {
  try {
    const results = await healthMonitor.checkAllSources();
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// نقطة لإعادة تعيين Circuit Breaker
app.post('/api/reset-breaker', (req, res) => {
  circuitBreaker.resetAll();
  res.json({ success: true, message: 'تم إعادة تعيين جميع قواطع الدائرة' });
});

// نقطة لعرض سجلات الأخطاء
app.get('/api/errors', (req, res) => {
  const stats = errorLogger.getErrorStats();
  res.json({ success: true, stats });
});

// بدء مراقبة الصحة عند تشغيل السيرفر (أضف بعد const PORT = ...)
healthMonitor.startMonitoring();
