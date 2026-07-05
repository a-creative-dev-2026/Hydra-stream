// ============================================================
// قائمة المصادر (مصنفة حسب النوع: أفلام، مسلسلات، أنمي)
// ============================================================

export const providers = [
  // =========================================================
  // 🔵 المصادر الأساسية (تعمل للأفلام والمسلسلات والأنمي)
  // =========================================================
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

  // =========================================================
  // 🟢 مصادر بديلة قوية (أفلام ومسلسلات)
  // =========================================================
  { 
    id: 'vidplay', 
    label: 'VidPlay (بديل VidLink)', 
    type: 'movie,tv',
    buildUrl: (p) => `https://vidplay.online/embed/${p.id}` 
  },
  { 
    id: 'filemoon', 
    label: 'FileMoon', 
    type: 'movie,tv',
    buildUrl: (p) => `https://filemoon.sx/e/${p.id}` 
  },
  { 
    id: 'streamwish', 
    label: 'StreamWish', 
    type: 'movie,tv',
    buildUrl: (p) => `https://streamwish.com/e/${p.id}` 
  },
  { 
    id: 'vidmoly', 
    label: 'VidMoly', 
    type: 'movie,tv',
    buildUrl: (p) => `https://vidmoly.to/embed-${p.id}.html` 
  },
  { 
    id: 'streamsb', 
    label: 'StreamSB', 
    type: 'movie,tv',
    buildUrl: (p) => `https://sbplay2.com/e/${p.id}.html` 
  },
  { 
    id: 'doodstream', 
    label: 'DoodStream', 
    type: 'movie,tv',
    buildUrl: (p) => `https://doodstream.com/d/${p.id}` 
  },
  { 
    id: 'streamtape', 
    label: 'StreamTape', 
    type: 'movie,tv',
    buildUrl: (p) => `https://streamtape.com/v/${p.id}` 
  },
  { 
    id: 'mixdrop', 
    label: 'MixDrop', 
    type: 'movie,tv',
    buildUrl: (p) => `https://mixdrop.co/e/${p.id}` 
  },

  // =========================================================
  // 🟡 مصادر الأنمي المتخصصة
  // =========================================================
  { 
    id: 'aniwatch', 
    label: 'AniWatch (Zoro)', 
    type: 'anime',
    buildUrl: (p) => `https://aniwatch.to/embed/${p.id}?ep=${p.episode || 1}` 
  },
  { 
    id: 'gogoanime', 
    label: 'GogoAnime', 
    type: 'anime',
    buildUrl: (p) => `https://gogoanime3.co/embed/${p.id}?ep=${p.episode || 1}` 
  },
  { 
    id: '9anime', 
    label: '9Anime', 
    type: 'anime',
    buildUrl: (p) => `https://9anime.to/embed/${p.id}?ep=${p.episode || 1}` 
  },
  { 
    id: 'animeheaven', 
    label: 'AnimeHeaven', 
    type: 'anime',
    buildUrl: (p) => `https://animeheaven.me/embed/${p.id}` 
  },
  { 
    id: 'animension', 
    label: 'Animension', 
    type: 'anime',
    buildUrl: (p) => `https://animension.to/embed/${p.id}` 
  },
  { 
    id: 'kickassanime', 
    label: 'KickAssAnime', 
    type: 'anime',
    buildUrl: (p) => `https://kickassanime.mx/embed/${p.id}` 
  },

  // =========================================================
  // 🟣 مصادر التضمين المتعددة (Embed Aggregators)
  // =========================================================
  { 
    id: 'superembed', 
    label: 'SuperEmbed', 
    type: 'all',
    buildUrl: (p) => `https://superembed.stream/embed/${p.id}` 
  },
  { 
    id: 'multiembed', 
    label: 'MultiEmbed', 
    type: 'all',
    buildUrl: (p) => `https://multiembed.mov/embed/${p.id}` 
  },
  { 
    id: '2embed', 
    label: '2Embed.ru', 
    type: 'all',
    buildUrl: (p) => `https://2embed.ru/embed/${p.id}` 
  },
  { 
    id: 'embedicu', 
    label: 'Embed.icu', 
    type: 'all',
    buildUrl: (p) => `https://embed.icu/embed/${p.id}` 
  },
  { 
    id: 'smashystream', 
    label: 'Smashy.stream', 
    type: 'all',
    buildUrl: (p) => `https://smashy.stream/embed/${p.id}` 
  }
];

// دالة مساعدة لبناء الرابط
export const buildUrl = (provider, params) => {
  return provider.buildUrl(params);
};
