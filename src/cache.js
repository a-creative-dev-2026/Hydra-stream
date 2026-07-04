import { providers, buildUrl } from './providers.js';
import { validateUrl } from './validator.js';

// خريطة التخزين: المفتاح = type:id (أو type:id:season:episode)
const cacheMap = new Map();
const CACHE_TTL = 60 * 60 * 1000; // ساعة واحدة

const getCacheKey = (params) => {
  const { type, id, season, episode } = params;
  if (type === 'movie') return `movie:${id}`;
  return `tv:${id}:s${season}:e${episode}`;
};

export const getStreams = async (params) => {
  const key = getCacheKey(params);

  // 1. التحقق من وجود البيانات في الكاش
  if (cacheMap.has(key)) {
    const entry = cacheMap.get(key);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش: ${key} - ${entry.sources.length} مصدر`);
      return entry.sources;
    }
    console.log(`⏳ انتهت صلاحية الكاش: ${key}`);
  }

  // 2. اختبار جميع المصادر بالتوازي
  console.log(`🔄 جاري اختبار 20 مصدراً لـ ${key}...`);
  const results = await Promise.all(
    providers.map(async (provider) => {
      const url = buildUrl(provider, params);
      const isValid = await validateUrl(url);
      return {
        id: provider.id,
        label: provider.label,
        url: url,
        status: isValid ? '✅ يعمل' : '❌ ميت'
      };
    })
  );

  // 3. فصل المصادر العاملة عن الميتة
  const working = results.filter(r => r.status === '✅ يعمل');
  const dead = results.filter(r => r.status === '❌ ميت');

  console.log(`📊 النتيجة: ${working.length} مصدر يعمل، ${dead.length} ميت`);

  // 4. ترتيب النتيجة (العاملة أولاً)
  const finalSources = [...working, ...dead];

  // 5. تخزين النتيجة في الكاش
  cacheMap.set(key, {
    timestamp: Date.now(),
    sources: finalSources
  });

  return finalSources;
};

// دالة للتحديث القسري (يدوياً)
export const refreshCache = (params) => getStreams(params);
