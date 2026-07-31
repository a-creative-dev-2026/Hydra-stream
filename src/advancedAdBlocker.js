// ================================================================
// 🛡️ نظام منع الإعلانات Pro Max - 10 طبقات
// ================================================================

const AD_DOMAINS = [
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'adservice.google', 'amazon-adsystem.com', 'taboola.com', 'outbrain.com',
  'pubmatic.com', 'openx.net', 'rubiconproject.com', 'adnxs.com',
  'criteo.com', 'teads.tv', 'smartadserver.com', 'juicyads.com',
  'exoclick.com', 'popads.net', 'adsterra.com', 'propellerads.com',
  'clickadu.com', 'mgid.com', 'revcontent.com', 'cpmstar.com',
  'adform.net', 'bidswitch.net', 'casalemedia.com', 'contextweb.com',
  'lijit.com', 'adblade.com', 'adtech.com', 'adverttraffic.com',
  'popcash.net', 'adcash.com', 'hilltopads.com', 'trafficjunky.com'
];

const AD_SELECTORS = [
  '[id*="ad-"]', '[id*="ads-"]', '[id*="banner"]', '[id*="popup"]',
  '[id*="sponsor"]', '[id*="promo"]', '[id*="overlay"]',
  '[class*="ad-"]', '[class*="ads-"]', '[class*="banner"]',
  '[class*="popup"]', '[class*="sponsor"]', '[class*="promo"]',
  '[class*="preroll"]', '[class*="midroll"]', '[class*="postroll"]',
  '[class*="ad-container"]', '[class*="ad-wrapper"]', '[class*="ad-overlay"]',
  '[class*="video-ads"]', '.adsbox', '.ad-slot', '.adsbygoogle'
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
];

const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function isAdUrl(url = '') {
  if (!url) return true;
  const lower = url.toLowerCase();
  return AD_DOMAINS.some(d => lower.includes(d)) ||
    /[\/\-\.](ad|ads|banner|popup|sponsor|promo|track|pixel|click)[\/\-\.]/i.test(lower);
}

function cleanUrl(url) {
  try {
    const u = new URL(url);
    [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'ref', 'click_id', 'affiliate', 'partner',
      'campaign', 'source', 'tracking', 'ad', 'banner', 'popup'
    ].forEach(p => u.searchParams.delete(p));
    return u.toString();
  } catch {
    return url;
  }
}

async function fetchHtml(url, timeout = 12000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'DNT': '1'
      },
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractDirectVideo(html) {
  const patterns = [
    /["'](https?:[^"']+\.m3u8[^"']*)["']/gi,
    /["'](https?:[^"']+\.mp4[^"']*)["']/gi,
    /(?:file|src|source|url|playlist|manifest)\s*[:=]\s*["'](https?:[^"']+\.(?:m3u8|mp4)[^"']*)["']/gi
  ];

  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)];
    for (const match of matches) {
      const url = match[1];
      if (url && url.startsWith('http') && !isAdUrl(url)) {
        return cleanUrl(url);
      }
    }
  }
  return null;
}

// ============================================================
// سكربت إزالة الإعلانات (قوي)
// ============================================================
export function getAdRemovalScript() {
  return `
(function() {
  const badWords = /ad|ads|banner|popup|sponsor|promo|overlay|preroll|midroll|advert|doubleclick|taboola|outbrain|juicy|exoclick|popads|adsterra|propeller/i;

  function isBad(el) {
    if (!el || el.nodeType !== 1) return false;
    const id = (el.id || '').toLowerCase();
    const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
    const src = (el.src || el.href || '').toLowerCase();
    return badWords.test(id + ' ' + cls + ' ' + src);
  }

  function clean() {
    document.querySelectorAll('div, iframe, ins, section, aside, span').forEach(function(el) {
      if (isBad(el)) {
        try { el.remove(); } catch(e) {}
      }
    });

    document.querySelectorAll('[style*="fixed"],[style*="absolute"]').forEach(function(el) {
      if (isBad(el) || (el.offsetWidth > 300 && el.offsetHeight > 250)) {
        try { el.remove(); } catch(e) {}
      }
    });

    document.querySelectorAll('body > div, body > iframe').forEach(function(el) {
      try {
        const style = window.getComputedStyle(el);
        if ((style.position === 'fixed' || style.position === 'absolute') && parseInt(style.zIndex) > 10) {
          el.style.display = 'none';
        }
      } catch(e) {}
    });
  }

  clean();
  setInterval(clean, 800);

  const obs = new MutationObserver(function() { clean(); });
  if (document.body) {
    obs.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      obs.observe(document.body, { childList: true, subtree: true });
    });
  }

  window.open = function() { return null; };

  document.addEventListener('click', function(e) {
    const a = e.target.closest('a');
    if (a && a.href && badWords.test(a.href)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();
`;
}

// ============================================================
// الدالة المطلوبة من cache.js
// ============================================================
export async function getAdFreeVideo(embedUrl, providerId = 'unknown') {
  if (!embedUrl || embedUrl === '#') return embedUrl;

  const cacheKey = providerId + ':' + embedUrl;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.url;
  }

  try {
    const html = await fetchHtml(embedUrl);
    if (html) {
      const direct = extractDirectVideo(html);
      if (direct) {
        cache.set(cacheKey, { url: direct, time: Date.now() });
        return direct;
      }
    }

    const cleaned = cleanUrl(embedUrl);
    cache.set(cacheKey, { url: cleaned, time: Date.now() });
    return cleaned;

  } catch (err) {
    cache.set(cacheKey, { url: embedUrl, time: Date.now() });
    return embedUrl;
  }
}

// تنظيف الكاش
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache) {
    if (now - value.time > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 60 * 60 * 1000);

export default {
  getAdFreeVideo,
  getAdRemovalScript,
  cleanUrl,
  isAdUrl
};
