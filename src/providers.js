// ============================================================
// قائمة المصادر (بدون رموز أو إضافات)
// ============================================================

export const providers = [
  // ===== المصادر الأساسية (تعمل) =====
  { 
    id: 'vidsrc.to', 
    label: 'VidSrc.to', 
    type: 'all',
    buildUrl: (p) => `https://vidsrc.to/embed/${p.type}/${p.id}${p.type === 'tv' ? `/${p.season}/${p.episode}` : ''}` 
  },
  { 
    id: 'vidsrc.pm', 
    label: 'VidSrc.pm', 
    type: 'all',
    buildUrl: (p) => `https://vidsrc.pm/embed/${p.type}/${p.id}${p.type === 'tv' ? `/${p.season}/${p.episode}` : ''}` 
  },
  { 
    id: 'vidsrc.me', 
    label: 'VidSrc.me', 
    type: 'all',
    buildUrl: (p) => `https://vidsrc.me/embed/${p.type}/${p.id}${p.type === 'tv' ? `/${p.season}/${p.episode}` : ''}` 
  },

  // ===== مصادر بديلة (تعمل) =====
  { 
    id: 'moviesapi', 
    label: 'MoviesAPI.to', 
    type: 'movie,tv',
    buildUrl: (p) => `https://moviesapi.to/embed/${p.type}/${p.id}${p.type === 'tv' ? `/${p.season}/${p.episode}` : ''}` 
  },

  // ===== مصادر جديدة (تحتاج اختبار) =====
  { 
    id: 'embed.su', 
    label: 'Embed.su', 
    type: 'all',
    buildUrl: (p) => `https://embed.su/embed/${p.id}` 
  },
  { 
    id: 'autoembed.cc', 
    label: 'AutoEmbed.cc', 
    type: 'all',
    buildUrl: (p) => `https://autoembed.cc/embed/${p.id}` 
  },
  { 
    id: 'novafork', 
    label: 'NovaFork.cc', 
    type: 'all',
    buildUrl: (p) => `https://novafork.cc/embed/${p.id}` 
  },
  { 
    id: 'streambucket', 
    label: 'StreamBucket.net', 
    type: 'all',
    buildUrl: (p) => `https://streambucket.net/embed/${p.id}` 
  },
  { 
    id: '456movie', 
    label: '456Movie.net', 
    type: 'movie',
    buildUrl: (p) => `https://456movie.net/embed/${p.id}` 
  },
  { 
    id: 'cineby', 
    label: 'Cineby.app', 
    type: 'movie,tv',
    buildUrl: (p) => `https://cineby.app/embed/${p.id}` 
  },
  { 
    id: 'myflixerz', 
    label: 'MyFlixerz.to', 
    type: 'movie,tv',
    buildUrl: (p) => `https://myflixerz.to/embed/${p.id}` 
  },
  { 
    id: 'hianime', 
    label: 'HiAnime.to', 
    type: 'anime',
    buildUrl: (p) => `https://hianime.to/embed/${p.id}?ep=${p.episode || 1}` 
  }
];

export const buildUrl = (provider, params) => {
  return provider.buildUrl(params);
};
