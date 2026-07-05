// ============================================================
// قائمة المصادر (محدثة - تعمل حالياً)
// ============================================================

export const providers = [
  // =========================================================
  // 🔵 المصادر الأساسية (تعمل للأفلام والمسلسلات)
  // =========================================================
  { 
    id: 'vidsrc.to', 
    label: 'VidSrc.to ✅', 
    type: 'all',
    buildUrl: (p) => `https://vidsrc.to/embed/${p.type}/${p.id}${p.type === 'tv' ? `/${p.season}/${p.episode}` : ''}` 
  },
  { 
    id: 'vidsrc.pm', 
    label: 'VidSrc.pm ✅', 
    type: 'all',
    buildUrl: (p) => `https://vidsrc.pm/embed/${p.type}/${p.id}${p.type === 'tv' ? `/${p.season}/${p.episode}` : ''}` 
  },
  { 
    id: 'vidsrc.me', 
    label: 'VidSrc.me ✅', 
    type: 'all',
    buildUrl: (p) => `https://vidsrc.me/embed/${p.type}/${p.id}${p.type === 'tv' ? `/${p.season}/${p.episode}` : ''}` 
  },

  // =========================================================
  // 🟢 مصادر بديلة قوية (تعمل - حسب تأكيدك)
  // =========================================================
  { 
    id: 'moviesapi', 
    label: 'MoviesAPI.to ✅', 
    type: 'movie,tv',
    buildUrl: (p) => `https://moviesapi.to/embed/${p.type}/${p.id}${p.type === 'tv' ? `/${p.season}/${p.episode}` : ''}` 
  },

  // =========================================================
  // 🟡 مصادر جديدة مقترحة (تحتاج اختبار - من Similarweb)
  // =========================================================
  { 
    id: 'embed.su', 
    label: 'Embed.su (جديد)', 
    type: 'all',
    buildUrl: (p) => `https://embed.su/embed/${p.id}` 
  },
  { 
    id: 'autoembed.cc', 
    label: 'AutoEmbed.cc (جديد)', 
    type: 'all',
    buildUrl: (p) => `https://autoembed.cc/embed/${p.id}` 
  },
  { 
    id: 'novafork', 
    label: 'NovaFork.cc (جديد)', 
    type: 'all',
    buildUrl: (p) => `https://novafork.cc/embed/${p.id}` 
  },
  { 
    id: 'streambucket', 
    label: 'StreamBucket.net (جديد)', 
    type: 'all',
    buildUrl: (p) => `https://streambucket.net/embed/${p.id}` 
  },
  { 
    id: '456movie', 
    label: '456Movie.net (جديد)', 
    type: 'movie',
    buildUrl: (p) => `https://456movie.net/embed/${p.id}` 
  },
  { 
    id: 'cineby', 
    label: 'Cineby.app (جديد)', 
    type: 'movie,tv',
    buildUrl: (p) => `https://cineby.app/embed/${p.id}` 
  },
  { 
    id: 'myflixerz', 
    label: 'MyFlixerz.to (جديد)', 
    type: 'movie,tv',
    buildUrl: (p) => `https://myflixerz.to/embed/${p.id}` 
  },
  { 
    id: 'hianime', 
    label: 'HiAnime.to (جديد - أنمي)', 
    type: 'anime',
    buildUrl: (p) => `https://hianime.to/embed/${p.id}?ep=${p.episode || 1}` 
  }
];

// دالة مساعدة لبناء الرابط
export const buildUrl = (provider, params) => {
  return provider.buildUrl(params);
};
