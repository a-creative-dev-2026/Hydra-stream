import { providers, buildUrl } from './providers.js';

// تخزين مؤقت بسيط (اختياري)
const memoryCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // ساعة واحدة

export const getStreams = async (params) => {
  const cacheKey = `${params.type}:${params.id}:${params.season}:${params.episode}`;
  
  // 1. التحقق من الكاش (تسريع الرد)
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش: ${cacheKey}`);
      return entry.sources;
    }
  }
  
  // 2. بناء الروابط بسرعة (بدون أي اتصال خارجي)
  const sources = providers.map((provider) => ({
    id: provider.id,
    label: provider.label,
    url: buildUrl(provider, params),
    status: 'ready'
  }));
  
  // 3. تخزين النتيجة في الكاش
  memoryCache.set(cacheKey, {
    timestamp: Date.now(),
    sources: sources
  });
  
  console.log(`✅ تم تجهيز ${sources.length} مصدراً لـ ${cacheKey}`);
  return sources;
};
