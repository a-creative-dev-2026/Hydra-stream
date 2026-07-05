// ============================================================
// قائمة المصادر (7 مصادر - تعمل جميعها)
// ============================================================

export const providers = [
  // ===== 1. MoviesAPI (يعمل - معرف رقمي) =====
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

  // ===== 2. Videasy (يعمل - معرف رقمي) =====
  {
    id: 'videasy',
    label: 'Videasy',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://player.videasy.net/movie/${p.id}`;
      } else if (p.type === 'tv') {
        return `https://player.videasy.net/tv/${p.id}`;
      }
      return '';
    }
  },

  // ===== 3. VidCore.org (يعمل - معرف رقمي) =====
  {
    id: 'vidcore',
    label: 'VidCore.org',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://www.vidcore.org/embed/movie/${p.id}`;
      } else if (p.type === 'tv') {
        return `https://www.vidcore.org/embed/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },

  // ===== 4. VidSrc.to (يعمل - معرف IMDb) =====
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
  },

  // ===== 5. VidSrc.pm (يعمل - معرف IMDb) =====
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

  // ===== 6. VidSrc.me (يعمل - معرف IMDb) =====
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

  // ===== 7. VidSrc.mov (يعمل - معرف IMDb) =====
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
  }
];

// ============================================================
// دالة مساعدة لبناء الرابط
// ============================================================
export const buildUrl = (provider, params) => {
  return provider.buildUrl(params);
};
