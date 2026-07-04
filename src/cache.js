import { providers, buildUrl } from './providers.js';
import { validateUrl } from './validator.js';

const cacheMap = new Map();
const CACHE_TTL = 60 * 60 * 1000; // ساعة

const getCacheKey = (params) => {
  const { type, id, season, episode } = params;
  if (type === 'movie') return `movie:${id}`;
  return `tv:${id}:s${season}:e${episode}`;
};

export const getStreams = async (params) => {
  const key = getCacheKey(params);

  // 1. التحقق من الكاش
  if (cacheMap.has(key)) {
    const entry = cacheMap.get(key);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش: ${key}`);
      return entry.sources;
    }
  }

  console.log(`🔄 جاري اختبار المصادر لـ ${key}...`);

  try {
    // 2. اختبار جميع المصادر بالتوازي، ولكن مع التقاط الأخطاء الفردية
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        const url = buildUrl(provider, params);
        const isValid = await validateUrl(url);
        return {
          id: provider.id,
          label: provider.label,
          url: url,
          status: isValid ? '✅ يعمل' : '❌ ميت (محجوب أو متعطل)'
        };
      })
    );

    // 3. استخراج النتائج الناجحة فقط (حتى لو فشل بعضها)
    const finalSources = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    // 4. ترتيب النتيجة (العاملة أولاً)
    const working = finalSources.filter(s => s.status === '✅ يعمل');
    const dead = finalSources.filter(s => s.status !== '✅ يعمل');

    const sortedSources = [...working, ...dead];

    // 5. خطة احتياطية قصوى: إذا كانت القائمة فارغة (حدث خطأ جسيم)، نعيد جميع المصادر كـ "محاولة"
    if (sortedSources.length === 0) {
      const fallback = providers.map(p => ({
        id: p.id,
        label: p.label,
        url: buildUrl(p, params),
        status: '⚠️ وضع الاحتياطي (حاول التشغيل)'
      }));
      cacheMap.set(key, { timestamp: Date.now(), sources: fallback });
      return fallback;
    }

    console.log(`📊 النتيجة: ${working.length} مصدر يعمل، ${dead.length} ميت`);
    cacheMap.set(key, { timestamp: Date.now(), sources: sortedSources });
    return sortedSources;

  } catch (error) {
    console.error('❌ خطأ فادح في جلب المصادر:', error.message);
    // في حالة خطأ عام، نعيد قائمة فارغة مع رسالة واضحة بدلاً من تعطل الخادم
    return [];
  }
};

export const refreshCache = (params) => getStreams(params);
