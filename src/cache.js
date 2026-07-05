// ============================================================
// نظام اختبار المصادر لكل فيلم/مسلسل على حدة (Smart Testing)
// ============================================================

import { providers, buildUrl } from './providers.js';

const memoryCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 دقائق

const testSource = async (provider, params) => {
  const url = buildUrl(provider, params);
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    const isAlive = response.ok || response.status === 403 || response.status === 302;

    return {
      ...provider,
      url,
      status: isAlive ? '✅ يعمل' : '❌ ميت',
      latency: isAlive ? `${latency}ms` : null,
      verified: isAlive
    };
  } catch (error) {
    return {
      ...provider,
      url,
      status: '❌ ميت',
      latency: null,
      verified: false
    };
  }
};

export const getStreams = async (params) => {
  const cacheKey = `${params.type}:${params.id}:${params.season}:${params.episode}`;

  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش (مختبر): ${cacheKey}`);
      return entry.sources;
    }
  }

  console.log(`🔄 جاري اختبار المصادر لـ ${params.id}...`);

  const testPromises = providers.map(provider => testSource(provider, params));
  const results = await Promise.all(testPromises);

  // تصفية المصادر العاملة وترتيبها حسب السرعة
  const working = results
    .filter(r => r.verified === true)
    .sort((a, b) => {
      const latencyA = parseInt(a.latency) || Infinity;
      const latencyB = parseInt(b.latency) || Infinity;
      return latencyA - latencyB;
    });

  memoryCache.set(cacheKey, {
    timestamp: Date.now(),
    sources: working
  });

  console.log(`✅ تم العثور على ${working.length} مصدراً يعمل (من أصل ${providers.length})`);
  return working;
};
