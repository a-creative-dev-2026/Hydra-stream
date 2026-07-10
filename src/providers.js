// ================================================================
// 🎬 قائمة المصادر الأساسية (7 مصادر - تعمل جميعها)
// ================================================================

export const providers = [
  // ============================================================
  // 1. VidSrc.to
  // ============================================================
  {
    id: 'vidsrc.to',
    label: 'VidSrc.to',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://vidsrc.to/embed/movie/${p.id}`;
      if (p.type === 'tv') return `https://vidsrc.to/embed/tv/${p.id}/${p.season}/${p.episode}`;
      return '';
    }
  },

  // ============================================================
  // 2. VidSrc.pm
  // ============================================================
  {
    id: 'vidsrc.pm',
    label: 'VidSrc.pm',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://vidsrc.pm/embed/movie/${p.id}`;
      if (p.type === 'tv') return `https://vidsrc.pm/embed/tv/${p.id}/${p.season}/${p.episode}`;
      return '';
    }
  },

  // ============================================================
  // 3. VidSrc.me
  // ============================================================
  {
    id: 'vidsrc.me',
    label: 'VidSrc.me',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://vidsrc.me/embed/movie/${p.id}`;
      if (p.type === 'tv') return `https://vidsrc.me/embed/tv/${p.id}/${p.season}/${p.episode}`;
      return '';
    }
  },

  // ============================================================
  // 4. VidCore
  // ============================================================
  {
    id: 'vidcore',
    label: 'VidCore',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://vidcore.org/embed/movie/${p.id}`;
      if (p.type === 'tv') return `https://vidcore.org/embed/tv/${p.id}/${p.season}/${p.episode}`;
      return '';
    }
  },

  // ============================================================
  // 5. VidSrc.top
  // ============================================================
  {
    id: 'vidsrc.top',
    label: 'VidSrc.top',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://vid-src.top/embed/movie/${p.id}`;
      if (p.type === 'tv') return `https://vid-src.top/embed/tv/${p.id}/${p.season}/${p.episode}`;
      return '';
    }
  },

  // ============================================================
  // 6. MoviesAPI
  // ============================================================
  {
    id: 'moviesapi',
    label: 'MoviesAPI',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://moviesapi.to/movie/${p.id}`;
      if (p.type === 'tv') return `https://moviesapi.to/tv/${p.id}/${p.season}/${p.episode}`;
      return '';
    }
  },

  // ============================================================
  // 7. 111Movies
  // ============================================================
  {
    id: '111movies',
    label: '111Movies',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://111movies.net/movie/${p.id}`;
      if (p.type === 'tv') return `https://111movies.net/tv/${p.id}/${p.season}/${p.episode}`;
      return '';
    }
  }
];

// ============================================================
// دالة مساعدة لبناء الرابط
// ============================================================
export const buildUrl = (provider, params) => {
  return provider.buildUrl(params);
};
