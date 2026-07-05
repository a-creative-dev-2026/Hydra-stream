import { probeAll } from 'tmdb-embed-providers';
import { providers, buildUrl } from './providers.js';

// مخزن للمصادر الحية
let liveSources = [];
let lastUpdate = 0;
const UPDATE_INTERVAL = 30 * 60 * 1000; // تحديث كل 30 دقيقة

// دالة لاختبار المصادر وتحديث القائمة
export const refreshSources = async () => {
  console.log('🔄 جاري اختبار المصادر وتحديثها...');
  
  try {
    // 1. اختبر جميع المصادر باستخدام probeAll
    const results = await Promise.all(
      providers.map(async (provider) => {
        const url = buildUrl(provider, { type: 'movie', id: 'tt1375666' });
        try {
          const response = await fetch(url, { method: 'HEAD', timeout: 4000 });
          return { ...provider, alive: response.ok };
        } catch {
          return { ...provider, alive: false };
        }
      })
    );
    
    // 2. استخرج المصادر الحية فقط
    const newLive = results.filter(r => r.alive === true);
    
    if (newLive.length > 0) {
      liveSources = newLive;
      lastUpdate = Date.now();
      console.log(`✅ تم التحديث: ${liveSources.length} مصدراً حياً من أصل ${providers.length}`);
      console.log('📋 المصادر الحية:', liveSources.map(s => s.id).join(', '));
    } else {
      console.warn('⚠️ لم يتم العثور على أي مصدر حي، الإبقاء على القائمة السابقة.');
    }
  } catch (error) {
    console.error('❌ فشل التحديث:', error.message);
  }
};

// دالة لجلب المصادر الحية
export const getLiveSources = async () => {
  const now = Date.now();
  if (now - lastUpdate > UPDATE_INTERVAL || liveSources.length === 0) {
    await refreshSources();
  }
  return liveSources.length > 0 ? liveSources : providers;
};

// بدء التحديث التلقائي في الخلفية
setInterval(refreshSources, UPDATE_INTERVAL);

// تحديث فوري عند بدء التشغيل
refreshSources();
