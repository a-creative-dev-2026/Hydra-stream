// ================================================================
// 🎬 قائمة المصادر الأساسية (12 مصدراً)
// 📅 تاريخ التحديث: 12 يوليو 2026
// ✅ جميع المصادر تعمل حالياً
// ================================================================

export const providers = [
  // ============================================================
  // 1. VidSrc.pm
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
  // 2. MoviesAPI
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
  // 3. 111Movies
  // ============================================================
  {
    id: '111movies',
    label: '111Movies',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://111movies.net/movie/${p.id}`;
      if (p.type === 'tv') return `https://111movies.net/tv/${p.id}/${p.season}/${p.episode}`;
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
  // 5. VidSrc.to
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
  // 6. VidSrc.me
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
  // 7. VidLink.pro
  // ============================================================
  {
    id: 'vidlink',
    label: 'VidLink.pro',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://vidlink.pro/movie/${p.id}`;
      if (p.type === 'tv') return `https://vidlink.pro/tv/${p.id}/${p.season}/${p.episode}`;
      return '';
    }
  },

  // ============================================================
  // 8. VsEmbed.ru
  // ============================================================
  {
    id: 'vsembed',
    label: 'VsEmbed.ru',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://vsembed.ru/embed/movie/${p.id}`;
      if (p.type === 'tv') return `https://vsembed.ru/embed/tv/${p.id}`;
      return '';
    }
  },

  // ============================================================
  // 9. VidSrc.top
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
  // 10. VidSpark.to
  // ============================================================
  {
    id: 'vidspark',
    label: 'VidSpark.to',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://vidspark.to/movie/${p.id}`;
      if (p.type === 'tv') return `https://vidspark.to/tv/${p.id}/${p.season}/${p.episode}`;
      return '';
    }
  },

  // ============================================================
  // 11. AutoEmbed.co
  // ============================================================
  {
    id: 'autoembed',
    label: 'AutoEmbed.co',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        if (p.id.startsWith('tt')) {
          return `https://autoembed.co/movie/imdb/${p.id}`;
        } else {
          return `https://autoembed.co/movie/tmdb/${p.id}`;
        }
      }
      if (p.type === 'tv') {
        if (p.id.startsWith('tt')) {
          return `https://autoembed.co/tv/imdb/${p.id}-${p.season}-${p.episode}`;
        } else {
          return `https://autoembed.co/tv/tmdb/${p.id}-${p.season}-${p.episode}`;
        }
      }
      return '';
    }
  },

  // ============================================================
  // 12. VidSrc.in
  // ============================================================
  {
    id: 'vidsrc.in',
    label: 'VidSrc.in',
    buildUrl: (p) => {
      if (p.type === 'movie') return `https://vidsrc.in/embed/movie/${p.id}`;
      if (p.type === 'tv') return `https://vidsrc.in/embed/tv/${p.id}/${p.season}/${p.episode}`;
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
