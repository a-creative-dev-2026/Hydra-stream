// ================================================================
// 📦 نظام التخزين المؤقت - نسخة سريعة
// ================================================================

import { providers, buildUrl } from './providers.js';
import { getAdFreeVideo } from './adBlocker.js';
import { searchSources, searchAnime } from './searchEngine.js';

const memoryCache = new Map();
const CACHE_TTL = 2 * 60 * 60 * 1000; // ساعتين (أطول لتقليل الاختبارات)

export const getStreams = async (params) => {
  const { type, id, season, episode } = params;
  const cacheKey = `${type}:${id}:${season}:${episode}`;

  // 1. التحقق من الكاش (أسرع)
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش: ${cacheKey}`);
      return entry.sources;
    }
  }

  console.log(`🔄 بحث سريع عن: ${id}`);

  let sources = [];

  // 2. البحث السريع (نستخدم المصادر الأساسية فقط)
  if (type === 'movie' || type === 'tv') {
    const searchParams = { type, id, season, episode };
    const searchResults = await searchSources(searchParams);
    
    // معالجة سريعة (بدون انتظار طويل)
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

  // 3. البحث عن أنمي (إذا لزم الأمر)
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

  // 4. خطة احتياطية (إذا لم نجد أي مصدر)
  if (sources.length === 0) {
    console.warn('⚠️ استخدام القائمة الاحتياطية');
    const allSources = providers.slice(0, 8).map((provider) => {
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

  // 5. ترتيب النتائج
  sources.sort((a, b) => {
    if (a.adFree && !b.adFree) return -1;
    if (!a.adFree && b.adFree) return 1;
    return 0;
  });

  // 6. تخزين في الكاش
  memoryCache.set(cacheKey, {
    timestamp: Date.now(),
    sources: sources
  });

  console.log(`✅ ${sources.length} مصدراً (${sources.filter(s => s.adFree).length} خالية من الإعلانات)`);
  return sources;
};

export const clearCache = () => {
  memoryCache.clear();
  console.log('🧹 تم تنظيف الكاش');
};
