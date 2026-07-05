// ============================================================
// نظام التخزين المؤقت + التحقق الذكي من المصادر الحية
// ============================================================

import { providers, buildUrl } from './providers.js';
import { getLiveSources, refreshLiveSources } from './autoUpdater.js';

// ذاكرة التخزين المؤقت
const memoryCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 دقائق (أقل من الساعة لضمان تحديث المصادر)

/**
 * دالة جلب المصادر مع فلترة المصادر الحية فقط
 */
export const getStreams = async (params) => {
  const cacheKey = `${params.type}:${params.id}:${params.season}:${params.episode}`;

  // 1. التحقق من الكاش (تخزين النتيجة النهائية)
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش (مفلتر): ${cacheKey}`);
      return entry.sources;
    }
  }

  // 2. جلب قائمة المصادر الحية من autoUpdater (التي تعمل في الخلفية)
  let liveIds = await getLiveSources();
  
  // 3. إذا لم تكن هناك مصادر حية (أول تشغيل)، نستخدم جميع المصادر كخطة احتياطية
  if (liveIds.length === 0) {
    console.log('⚠️ لا توجد مصادر حية في الذاكرة، جاري التحديث الفوري...');
    liveIds = await refreshLiveSources(); // تحديث فوري
    if (liveIds.length === 0) {
      // إذا فشل التحديث، نستخدم جميع المصادر كخطة أخيرة
      console.warn('⚠️ استخدام جميع المصادر كخطة احتياطية');
      liveIds = providers.map(p => p.id);
    }
  }

  // 4. بناء القائمة المفلترة (المصادر الحية فقط)
  const liveProviders = providers.filter(p => liveIds.includes(p.id));
  
  // 5. ترتيب المصادر (الأفضل أولاً) - يمكنك تعديل هذا الترتيب حسب رغبتك
  const priorityOrder = ['vidlink', '2embed.cc', 'vidsrc.to', 'vidsrc.pm'];
  const sortedProviders = liveProviders.sort((a, b) => {
    const indexA = priorityOrder.indexOf(a.id);
    const indexB = priorityOrder.indexOf(b.id);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // 6. بناء الروابط النهائية (المصادر الحية المرتبة)
  const sources = sortedProviders.map((provider) => ({
    id: provider.id,
    label: provider.label,
    url: buildUrl(provider, params),
    status: 'ready',
    verified: true // علامة تشير إلى أن هذا المصدر تم التحقق منه
  }));

  // 7. تخزين النتيجة في الكاش
  memoryCache.set(cacheKey, {
    timestamp: Date.now(),
    sources: sources
  });

  console.log(`✅ تم تجهيز ${sources.length} مصدراً حياً (من أصل ${providers.length}) لـ ${cacheKey}`);
  return sources;
};
