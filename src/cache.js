// ================================================================
// 📦 التخزين المؤقت - مع إعادة الاختبار لكل طلب
// ================================================================

import { providers, buildUrl } from './providers.js';
import { getAdFreeVideo } from './advancedAdBlocker.js';
import { searchSources, searchAnime } from './searchEngine.js';

// كاش قصير المدى (5 دقائق فقط) لتسريع الطلبات المتكررة
const memoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 دقائق فقط

export const getStreams = async (params) => {
  const { type, id, season, episode } = params;
  const cacheKey = `${type}:${id}:${season}:${episode}`;

  // التحقق من الكاش (فقط للطلبات المتكررة خلال 5 دقائق)
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش (محدث): ${cacheKey}`);
      return entry.sources;
    }
  }

  console.log(`🔄 جاري الاختبار الفعلي والترتيب الديناميكي عن: ${id}`);

  let sources = [];

  // البحث في جميع المصادر (أفلام ومسلسلات)
  if (type === 'movie' || type === 'tv') {
    const searchParams = { type, id, season, episode };
    const searchResults = await searchSources(searchParams);
    
    // تطبيق منع الإعلانات مع الحفاظ على الترتيب
    const processedResults = await Promise.all(
      searchResults.map(async (result) => {
        let adFreeUrl = result.url;
        let adFree = false;
        
        if (result.isAlive && result.url) {
          adFreeUrl = await getAdFreeVideo(result.url, result.provider);
          adFree = adFreeUrl !== result.url;
        }
        
        return {
          ...result,
          url: adFreeUrl || result.url,
          adFree: adFree,
          status: result.isAlive ? '✅ يعمل' : '❌ لا يعمل'
        };
      })
    );
    
    sources = processedResults;
  }

  // البحث عن أنمي
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
        adFree: adFreeUrl !== animeResult.url,
        status: '✅ يعمل'
      });
    }
  }

  // خطة احتياطية
  if (sources.length === 0) {
    console.warn('⚠️ استخدام القائمة الاحتياطية');
    const allSources = providers.map((provider) => {
      const url = buildUrl(provider, params);
      return {
        provider: provider.id,
        label: provider.label,
        url: url,
        id: id,
        type: 'embed',
        adFree: false,
        status: '⚠️ غير مختبر',
        isAlive: false
      };
    });
    sources = allSources;
  }

  // تخزين في الكاش (لمدة 5 دقائق فقط)
  memoryCache.set(cacheKey, {
    timestamp: Date.now(),
    sources: sources
  });

  const aliveCount = sources.filter(s => s.isAlive === true).length;
  console.log(`✅ ${aliveCount} مصدراً يعمل من أصل ${sources.length}`);
  
  return sources;
};

export const clearCache = () => {
  memoryCache.clear();
  console.log('🧹 تم تنظيف الكاش');
};
