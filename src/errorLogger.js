import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'errors.log');

export const errorLogger = {
  logError(providerId, error, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      providerId,
      error: error.message || String(error),
      context,
      stack: error.stack
    };
    
    // تسجيل في ملف
    try {
      fs.appendFileSync(
        LOG_FILE,
        JSON.stringify(logEntry) + '\n',
        { flag: 'a' }
      );
    } catch (e) {
      console.warn('⚠️ تعذر كتابة سجل الأخطاء:', e.message);
    }
    
    // تسجيل في وحدة التحكم (للمراقبة السريعة)
    console.warn(`❌ خطأ في ${providerId}:`, error.message || error);
  },
  
  // قراءة الأخطاء من الملف (للتحليل)
  getErrorLogs(limit = 100) {
    try {
      if (!fs.existsSync(LOG_FILE)) return [];
      const content = fs.readFileSync(LOG_FILE, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      return lines.slice(-limit).map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  },
  
  // تحليل الأخطاء (إحصائيات)
  getErrorStats() {
    const logs = this.getErrorLogs(500);
    const stats = {};
    
    logs.forEach(log => {
      if (!stats[log.providerId]) {
        stats[log.providerId] = { count: 0, errors: [] };
      }
      stats[log.providerId].count += 1;
      stats[log.providerId].errors.push(log.error);
    });
    
    return stats;
  }
};
