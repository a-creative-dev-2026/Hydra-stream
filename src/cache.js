import { providers, buildUrl } from './providers.js';

export const getStreams = async (params) => {
  // بناء الروابط مباشرة (بدون أي اتصال خارجي)
  const sources = providers.map((provider) => ({
    id: provider.id,
    label: provider.label,
    url: buildUrl(provider, params),
    status: 'ready'
  }));

  return sources;
};
