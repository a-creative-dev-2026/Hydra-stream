// ============================================================
// قائمة المصادر (مرتبة أبجدياً)
// ============================================================

export const providers = [
  // ===== مصادر تبدأ بـ (m) =====
  {
    id: 'moviesapi',
    label: 'MoviesAPI',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://moviesapi.to/movie/${p.id}`;
      } else if (p.type === 'tv') {
        return `https://moviesapi.to/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },

  // ===== مصادر تبدأ بـ (v) =====
  {
    id: 'vidsrc-embed',
    label: 'VidSrc-embed.ru',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://vidsrc-embed.ru/embed/movie/${p.id}`;
      } else if (p.type === 'tv') {
        return `https://vidsrc-embed.ru/embed/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },
  {
    id: 'vidsrc.me',
    label: 'VidSrc.me',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://vidsrc.me/embed/movie/${p.id}`;
      } else if (p.type === 'tv') {
        return `https://vidsrc.me/embed/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },
  {
    id: 'vidsrc.mov',
    label: 'VidSrc.mov',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://vidsrc.mov/embed/movie/${p.id}`;
      } else if (p.type === 'tv') {
        return `https://vidsrc.mov/embed/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },
  {
    id: 'vidsrc.pm',
    label: 'VidSrc.pm',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://vidsrc.pm/embed/movie/${p.id}`;
      } else if (p.type === 'tv') {
        return `https://vidsrc.pm/embed/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },
  {
    id: 'vidsrc.to',
    label: 'VidSrc.to',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://vidsrc.to/embed/movie/${p.id}`;
      } else if (p.type === 'tv') {
        return `https://vidsrc.to/embed/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  }
];

export const buildUrl = (provider, params) => {
  return provider.buildUrl(params);
};
