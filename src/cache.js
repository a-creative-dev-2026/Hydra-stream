// ============================================================
// نظام إعادة المصادر بدون اختبار (لتجنب الحجب والخطأ)
// ============================================================

import { providers, buildUrl } from './providers.js';

// ذاكرة تخزين مؤقتة بسيطة (لمدة ساعة)
const memoryCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // ساعة واحدة

export const getStreams = async (params) => {
  const cacheKey = `${params.type}:${params.id}:${params.season}:${params.episode}`;

  // التحقق من الكاش (تسريع الردود)
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش: ${cacheKey}`);
      return entry.sources;
    }
  }

  // بناء جميع الروابط (بدون أي اختبار)
  const sources = providers.map((provider) => ({
    id: provider.id,
    label: provider.label,
    url: buildUrl(provider, params),
    status: 'ready', // جاهز للتجربة في التطبيق
    // إضافة تصنيف للمساعدة في الترتيب (اختياري)
    priority: provider.priority || 5 // القيمة الافتراضية 5
  }));

  // ترتيب المصادر حسب الأولوية (إن وجدت)
  const sortedSources = sources.sort((a, b) => (a.priority || 5) - (b.priority || 5));

  // تخزين النتيجة في الكاش
  memoryCache.set(cacheKey, {
    timestamp: Date.now(),
    sources: sortedSources
  });

  console.log(`✅ تم تجهيز ${sources.length} مصدراً لـ ${cacheKey}`);
  return sortedSources;
};
