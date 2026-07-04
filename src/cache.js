import { providers, buildUrl } from './providers.js';

export const getStreams = async (params) => {
  // نبني جميع الروابط دون أي اتصال خارجي
  const sources = providers.map((provider) => ({
    id: provider.id,
    label: provider.label,
    url: buildUrl(provider, params),
    status: 'ready'
  }));

  return sources;
};

export const refreshCache = (params) => getStreams(params);
