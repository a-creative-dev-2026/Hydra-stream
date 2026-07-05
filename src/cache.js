// ============================================================
// نظام التخزين المؤقت (Caching System)
// ============================================================

import { providers, buildUrl } from './providers.js';

// ذاكرة التخزين المؤقت
const memoryCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // ساعة واحدة

/**
 * دالة جلب المصادر مع تخزين مؤقت
 * @param {Object} params - معاملات الفيلم/المسلسل
 * @returns {Array} قائمة المصادر
 */
export const getStreams = async (params) => {
  const cacheKey = `${params.type}:${params.id}:${params.season}:${params.episode}`;

  // 1. التحقق من الكاش
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش: ${cacheKey}`);
      return entry.sources;
    }
  }

  // 2. بناء الروابط
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
