export const providers = [
  {
    id: 'source1',
    label: 'Source 1',
    buildUrl: (p) =>
      `https://example.com/embed/${p.type}/${p.id}${p.type === 'tv' ? `/${p.season}/${p.episode}` : ''}`
  },
  {
    id: 'source2',
    label: 'Source 2',
    buildUrl: (p) =>
      `https://example.org/embed/${p.type}/${p.id}${p.type === 'tv' ? `/${p.season}/${p.episode}` : ''}`
  },
  {
    id: 'source3',
    label: 'Source 3',
    buildUrl: (p) =>
      `https://example.net/embed/${p.type}/${p.id}${p.type === 'tv' ? `/${p.season}/${p.episode}` : ''}`
  }
];

export const buildUrl = (provider, params) => provider.buildUrl(params);
