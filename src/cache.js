// ================================================================
// 📦 نظام التخزين المؤقت (محدث لدعم المصادر والمفقودات)
// ================================================================

import { providers, buildUrl } from './providers.js';
import { getAdFreeVideo, buildProxyUrl } from './advancedAdBlocker.js';
import { searchSources, searchAnime } from './searchEngine.js';
import { missingContent, findMissingContent, getMissingContentByType } from './missingContent.js';

const memoryCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // ساعة واحدة

export const getStreams = async (params) => {
  const { type, id, season, episode } = params;
  const cacheKey = `${type}:${id}:${season}:${episode}`;

  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش: ${cacheKey}`);
      return entry.sources;
    }
  }

  console.log(`🔍 جاري البحث عن: ${id}`);

  let sources = [];

  if (id && id.startsWith('missing-')) {
    const missing = findMissingContent(type, id);
    if (missing) {
      if (missing.episodes) {
        sources = missing.episodes.map(ep => ({
          id: `${missing.id}-ep${ep.number}`,
          label: `${missing.label} - الحلقة ${ep.number}`,
          url: ep.iframeUrl,
          proxyUrl: buildProxyUrl(ep.iframeUrl),
          status: 'ready',
          isMissing: true,
          type: 'direct',
          episode: ep.number
        }));
      } else {
        sources = [{
          id: missing.id,
          label: missing.label,
          url: missing.iframeUrl,
          proxyUrl: buildProxyUrl(missing.iframeUrl),
          status: 'ready',
          isMissing: true,
          type: 'direct'
        }];
      }
      
      memoryCache.set(cacheKey, {
        timestamp: Date.now(),
        sources: sources
      });
      console.log(`✅ تم العثور على محتوى مفقود: ${missing.label} (${sources.length} مصدر)`);
      return sources;
    }
  }

  if (type === 'movie' || type === 'tv') {
    const searchParams = { type, id, season, episode };
    const searchResults = await searchSources(searchParams);
    
    const processedResults = await Promise.all(
      searchResults.map(async (result) => {
        let adFreeUrl = result.url;
        let adFree = false;
        
        if (result.isAlive && result.url && result.url !== '#') {
          adFreeUrl = await getAdFreeVideo(result.url, result.provider);
          adFree = adFreeUrl !== result.url;
        }

        const finalUrl = adFreeUrl || result.url;

        return {
          ...result,
          url: finalUrl,
          proxyUrl: buildProxyUrl(finalUrl),
          adFree: adFree,
          status: result.isAlive ? '✅ يعمل' : '❌ لا يعمل'
        };
      })
    );
    
    sources = processedResults;
  }

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
        proxyUrl: buildProxyUrl(adFreeUrl),
        adFree: adFreeUrl !== animeResult.url,
        status: '✅ يعمل'
      });
    }
  }

  if (sources.length === 0) {
    const missingByType = getMissingContentByType(type);
    if (missingByType.length > 0) {
      sources = missingByType.flatMap(item => {
        if (item.episodes) {
          return item.episodes.map(ep => ({
            id: `${item.id}-ep${ep.number}`,
            label: `${item.label} - الحلقة ${ep.number}`,
            url: ep.iframeUrl,
            proxyUrl: buildProxyUrl(ep.iframeUrl),
            status: '✅ يعمل (محتوى مفقود)',
            isMissing: true,
            type: 'direct',
            episode: ep.number
          }));
        } else {
          return [{
            id: item.id,
            label: item.label,
            url: item.iframeUrl,
            proxyUrl: buildProxyUrl(item.iframeUrl),
            status: '✅ يعمل (محتوى مفقود)',
            isMissing: true,
            type: 'direct'
          }];
        }
      });
      console.log(`✅ تم العثور على ${sources.length} محتوى مفقود من نوع ${type}`);
    }
  }

  memoryCache.set(cacheKey, {
    timestamp: Date.now(),
    sources: sources
  });

  const aliveCount = sources.filter(s => s.status.includes('يعمل')).length;
  console.log(`✅ ${aliveCount} مصدراً يعمل من أصل ${sources.length}`);
  
  return sources;
};

export const clearCache = () => {
  memoryCache.clear();
  console.log('🧹 تم تنظيف الكاش');
};
