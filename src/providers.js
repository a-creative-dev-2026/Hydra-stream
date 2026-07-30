// ================================================================
// 🎬 قائمة المصادر (24 مصدراً) - نسخة نهائية
// 📅 تاريخ التحديث: 30 يوليو 2026
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
  },

  // ============================================================
  // 13. SmashyStream Player
  // ============================================================
  {
    id: 'smashystream',
    label: 'SmashyStream',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://player.smashystream.com/playere.php?tmdb=${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://player.smashystream.com/playere.php?tmdb=${p.id}&s=${p.season}&e=${p.episode}`;
      }
      return '';
    }
  },

  // ============================================================
  // 14. Vidzee Player
  // ============================================================
  {
    id: 'vidzee',
    label: 'Vidzee Player',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://player.vidzee.wtf/embed/movie/${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://player.vidzee.wtf/embed/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },

  // ============================================================
  // 15. Videasy Player
  // ============================================================
  {
    id: 'videasy',
    label: 'Videasy Player',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://player.videasy.to/movie/${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://player.videasy.to/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },

  // ============================================================
  // 16. VidNest
  // ============================================================
  {
    id: 'vidnest',
    label: 'VidNest',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://vidnest.fun/movie/${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://vidnest.fun/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },

  // ============================================================
  // 17. VidKing
  // ============================================================
  {
    id: 'vidking',
    label: 'VidKing',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://www.vidking.net/embed/movie/${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://www.vidking.net/embed/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },

  // ============================================================
  // 18. VidRock
  // ============================================================
  {
    id: 'vidrock',
    label: 'VidRock',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://vidrock.net/movie/${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://vidrock.net/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },

  // ============================================================
  // 19. PrimeSrc
  // ============================================================
  {
    id: 'primesrc',
    label: 'PrimeSrc',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://primesrc.me/embed/movie?tmdb=${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://primesrc.me/embed/tv?tmdb=${p.id}&s=${p.season}&e=${p.episode}`;
      }
      return '';
    }
  },

  // ============================================================
  // 20. CineSrc
  // ============================================================
  {
    id: 'cinesrc',
    label: 'CineSrc',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://cinesrc.st/embed/movie/${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://cinesrc.st/embed/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },

  // ============================================================
  // 21. 1Embed
  // ============================================================
  {
    id: '1embed',
    label: '1Embed.cc',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://1embed.cc/embed/movie/${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://1embed.cc/embed/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },

  // ============================================================
  // 22. Peachify
  // ============================================================
  {
    id: 'peachify',
    label: 'Peachify',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://peachify.pro/embed/movie/${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://peachify.pro/embed/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },

  // ============================================================
  // 23. FilmU
  // ============================================================
  {
    id: 'filmu',
    label: 'FilmU',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://embed.filmu.in/movie/${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://embed.filmu.in/tv/${p.id}/${p.season}/${p.episode}`;
      }
      return '';
    }
  },

  // ============================================================
  // 24. VidZen
  // ============================================================
  {
    id: 'vidzen',
    label: 'VidZen',
    buildUrl: (p) => {
      if (p.type === 'movie') {
        return `https://vidzen.fun/movie/${p.id}`;
      }
      if (p.type === 'tv') {
        return `https://vidzen.fun/tv/${p.id}/${p.season}/${p.episode}`;
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
