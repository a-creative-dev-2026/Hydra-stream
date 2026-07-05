// ============================================================
// نظام اختبار المصادر لكل فيلم/مسلسل على حدة (Smart Testing)
// ============================================================

import { providers, buildUrl } from './providers.js';

// ذاكرة التخزين المؤقت (لكل فيلم على حدة)
const memoryCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 دقائق

/**
 * اختبار مصدر واحد مع مهلة زمنية (Timeout)
 */
const testSource = async (provider, params) => {
  const url = buildUrl(provider, params);
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // مهلة 4 ثوانٍ

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
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
    // فشل الاتصال (Timeout أو Network Error)
    return {
      ...provider,
      url,
      status: '❌ ميت (تعذر الاتصال)',
      latency: null,
      verified: false,
      error: error.message
    };
  }
};

/**
 * دالة جلب المصادر مع اختبار لحظي لكل فيلم
 */
export const getStreams = async (params) => {
  const cacheKey = `${params.type}:${params.id}:${params.season}:${params.episode}`;

  // 1. التحقق من الكاش (لتجنب إعادة الاختبار)
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش (مختبر مسبقاً): ${cacheKey}`);
      return entry.sources;
    }
  }

  console.log(`🔄 جاري اختبار جميع المصادر لـ ${params.id} (قد يستغرق 3-5 ثوانٍ)...`);

  // 2. اختبار جميع المصادر بالتوازي (للسرعة)
  const testPromises = providers.map(provider => testSource(provider, params));
  const results = await Promise.all(testPromises);

  // 3. ترتيب النتائج: المصادر العاملة أولاً، ثم الميتة
  const working = results.filter(r => r.verified === true);
  const dead = results.filter(r => r.verified === false);

  // 4. ترتيب المصادر العاملة حسب السرعة (الأسرع أولاً)
  working.sort((a, b) => {
    const latencyA = parseInt(a.latency) || Infinity;
    const latencyB = parseInt(b.latency) || Infinity;
    return latencyA - latencyB;
  });

  const sortedSources = [...working, ...dead];

  // 5. تخزين النتيجة في الكاش
  memoryCache.set(cacheKey, {
    timestamp: Date.now(),
    sources: sortedSources
  });

  console.log(`✅ اكتمل الاختبار: ${working.length} مصدر يعمل، ${dead.length} مصدر ميت`);
  return sortedSources;
};
