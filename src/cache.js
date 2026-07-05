import { providers, buildUrl } from './providers.js';
import { getAdFreeVideo } from './adBlocker.js';

export const getStreams = async (params) => {
    const sources = await Promise.all(
        providers.map(async (provider) => {
            const embedUrl = buildUrl(provider, params);
            // محاولة الحصول على فيديو خالٍ من الإعلانات
            const videoUrl = await getAdFreeVideo(embedUrl);
            
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

    // ترتيب المصادر: الخالية من الإعلانات أولاً
    return sources.sort((a, b) => {
        if (a.adFree && !b.adFree) return -1;
        if (!a.adFree && b.adFree) return 1;
        return 0;
    });
};
