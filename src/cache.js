import { providers, buildUrl } from './providers.js';

// خريطة التخزين المؤقت (لكل فيلم/مسلسل)
const cacheMap = new Map();
const CACHE_TTL = 60 * 60 * 1000; // ساعة واحدة

const getCacheKey = (params) => {
  const { type, id, season, episode } = params;
  if (type === 'movie') return `movie:${id}`;
  return `tv:${id}:s${season}:e${episode}`;
};

export const getStreams = async (params) => {
  const key = getCacheKey(params);

  // 1. التحقق من الكاش (للسرعة الفائقة)
  if (cacheMap.has(key)) {
    const entry = cacheMap.get(key);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش: ${key}`);
      return entry.sources;
    }
  }

  console.log(`🔄 جاري بناء روابط لـ ${key}...`);

  // 2. بناء جميع الروابط الـ 20 دون اختبار (لأن السيرفر السحابي محجوب)
  //    التطبيق (العميل) هو الذي سيختبر الصلاحية عند التشغيل
  const sources = providers.map((provider) => ({
    id: provider.id,
    label: provider.label,
    url: buildUrl(provider, params),
    status: '✅ جاهز للتشغيل (حاول في التطبيق)'
  }));

  // 3. تخزين النتيجة في الكاش
  cacheMap.set(key, {
    timestamp: Date.now(),
    sources: sources
  });

  console.log(`✅ تم تجهيز ${sources.length} مصدر لـ ${key}`);
  return sources;
};

// دالة التحديث القسري (نفس الشيء)
export const refreshCache = (params) => getStreams(params);
