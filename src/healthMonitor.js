import { providers, buildUrl } from './providers.js';
import { circuitBreaker } from './circuitBreaker.js';

export const healthMonitor = {
  // فحص مصدر معين
  async checkSource(provider) {
    const url = buildUrl(provider, { type: 'movie', id: 'tt1375666' });
    try {
      const start = Date.now();
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
        }
      });
      const latency = Date.now() - start;
      
      return {
        id: provider.id,
        label: provider.label,
        status: response.ok ? 'healthy' : 'unhealthy',
        latency,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        id: provider.id,
        label: provider.label,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },
  
  // فحص جميع المصادر
  async checkAllSources() {
    console.log('🔄 جاري فحص صحة جميع المصادر...');
    const results = await Promise.all(
      providers.map(p => this.checkSource(p))
    );
    
    const healthy = results.filter(r => r.status === 'healthy');
    console.log(`✅ ${healthy.length}/${providers.length} مصادر سليمة`);
    
    return results;
  },
  
  // بدء المراقبة الدورية (كل 30 دقيقة)
  startMonitoring(interval = 30 * 60 * 1000) {
    this.checkAllSources(); // فحص أولي
    setInterval(async () => {
      await this.checkAllSources();
    }, interval);
    console.log('📊 بدأت مراقبة صحة المصادر (كل 30 دقيقة)');
  }
};
