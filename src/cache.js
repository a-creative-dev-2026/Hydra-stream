// ================================================================
// 📦 نظام التخزين المؤقت مع البحث التلقائي
// ================================================================

import { providers, buildUrl } from './providers.js';
import { getAdFreeVideo } from './adBlocker.js';
import { searchSources, searchAnime } from './searchEngine.js';

const memoryCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // ساعة واحدة

export const getStreams = async (params) => {
  const { type, id, season, episode } = params;
  const cacheKey = `${type}:${id}:${season}:${episode}`;

  // 1. التحقق من الكاش
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش: ${cacheKey}`);
      return entry.sources;
    }
  }

  console.log(`🔄 جاري البحث التلقائي عن: ${id}`);

  let sources = [];

  // 2. البحث في المصادر العامة (أفلام ومسلسلات)
  if (type === 'movie' || type === 'tv') {
    const searchParams = { type, id, season, episode };
    const searchResults = await searchSources(searchParams);
    
    // 3. محاولة منع الإعلانات لكل مصدر
    const cleanedResults = await Promise.all(
      searchResults.map(async (result) => {
        const adFreeUrl = await getAdFreeVideo(result.url, result.provider);
        return {
          ...result,
          url: adFreeUrl,
          adFree: adFreeUrl !== result.url
        };
      })
    );
    
    sources = cleanedResults;
  }

  // 4. إذا كان المطلوب أنمي، نضيف مصادر الأنمي
  if (type === 'anime' || (type === 'tv' && params.animeSource)) {
    const animeParams = { 
      id, 
      season, 
      episode, 
      language: params.language || 'sub',
      source: params.animeSource || 's-2'
    };
    const animeResult = await searchAnime(animeParams);
    if (animeResult) {
      const adFreeUrl = await getAdFreeVideo(animeResult.url, 'animeplay');
      sources.push({
        ...animeResult,
        url: adFreeUrl,
        adFree: adFreeUrl !== animeResult.url
      });
    }
  }

  // 5. إذا لم نجد أي مصادر، نستخدم جميع المصادر كخطة احتياطية
  if (sources.length === 0) {
    console.warn('⚠️ لم يتم العثور على مصادر، استخدام القائمة الكاملة');
    const allSources = providers.map((provider) => {
      const url = buildUrl(provider, params);
      return {
        provider: provider.id,
        label: provider.label,
        url: url,
        id: id,
        type: 'embed',
        quality: 'auto',
        adFree: false
      };
    });
    sources = allSources;
  }

  // 6. ترتيب النتائج: الخالية من الإعلانات أولاً
  sources.sort((a, b) => {
    if (a.adFree && !b.adFree) return -1;
    if (!a.adFree && b.adFree) return 1;
    return 0;
  });

  // 7. تخزين النتيجة في الكاش
  memoryCache.set(cacheKey, {
    timestamp: Date.now(),
    sources: sources
  });

  console.log(`✅ تم العثور على ${sources.length} مصدراً (${sources.filter(s => s.adFree).length} خالية من الإعلانات)`);
  return sources;
};

// دالة تنظيف الكاش
export const clearCache = () => {
  memoryCache.clear();
  console.log('🧹 تم تنظيف الكاش');
};

// دالة حذف عنصر معين من الكاش
export const removeFromCache = (key) => {
  memoryCache.delete(key);
  console.log(`🗑️ تم حذف ${key} من الكاش`);
};
