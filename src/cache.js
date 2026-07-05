import { getLiveSources } from './autoUpdater.js';
import { buildUrl } from './providers.js';

export const getStreams = async (params) => {
  // 1. احصل على المصادر الحية (محدثة تلقائياً)
  const liveProviders = await getLiveSources();
  
  // 2. ابنِ الروابط من المصادر الحية فقط
  const sources = liveProviders.map((provider) => ({
    id: provider.id,
    label: provider.label,
    url: buildUrl(provider, params),
    status: 'ready'
  }));
  
  return sources;
};
