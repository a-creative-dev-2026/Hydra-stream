import { providers, buildUrl } from './providers.js';
import { getAdFreeVideo } from './adBlocker.js';

const memoryCache = new Map();
const CACHE_TTL = 60 * 60 * 1000;

export const getStreams = async (params) => {
    const cacheKey = `${params.type}:${params.id}:${params.season}:${params.episode}`;

    if (memoryCache.has(cacheKey)) {
        const entry = memoryCache.get(cacheKey);
        if (Date.now() - entry.timestamp < CACHE_TTL) {
            return entry.sources;
        }
    }

    const sources = await Promise.all(
        providers.map(async (provider) => {
            const embedUrl = buildUrl(provider, params);
            // محاولة الحصول على فيديو خالٍ من الإعلانات باستخدام الروابط المباشرة
            const videoUrl = await getAdFreeVideo(embedUrl, provider.id, params);
            
            return {
                id: provider.id,
                label: provider.label,
                url: videoUrl,
                embedUrl: embedUrl,
                status: 'ready',
                adFree: videoUrl !== embedUrl
            };
        })
    );

    const sortedSources = sources.sort((a, b) => {
        if (a.adFree && !b.adFree) return -1;
        if (!a.adFree && b.adFree) return 1;
        return 0;
    });

    memoryCache.set(cacheKey, {
        timestamp: Date.now(),
        sources: sortedSources
    });

    return sortedSources;
};
