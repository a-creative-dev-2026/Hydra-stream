// ================================================================
// 🛡️ نظام منع الإعلانات Pro Max - 10 طبقات
// يعمل على جميع المصادر (25 مصدر) بدون استثناء
// بدون Sandbox
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
  'popcash.net', 'adcash.com', 'hilltopads.com', 'trafficjunky.com',
  'adthrive.com', 'media.net', 'adnami.io', 'adzerk.net'
];

const AD_SELECTORS = [
  '[id*="ad-"]', '[id*="ads-"]', '[id*="banner"]', '[id*="popup"]',
  '[id*="sponsor"]', '[id*="promo"]', '[id*="overlay"]',
  '[class*="ad-"]', '[class*="ads-"]', '[class*="banner"]',
  '[class*="popup"]', '[class*="sponsor"]', '[class*="promo"]',
  '[class*="preroll"]', '[class*="midroll"]', '[class*="postroll"]',
  '[class*="ad-container"]', '[class*="ad-wrapper"]', '[class*="ad-overlay"]',
  '[class*="video-ads"]', '.adsbox', '.ad-slot', '.adsbygoogle',
  'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
  'iframe[src*="adservice"]', 'iframe[src*="taboola"]', 'iframe[src*="outbrain"]',
  'iframe[src*="juicyads"]', 'iframe[src*="exoclick"]', 'iframe[src*="popads"]',
  'iframe[src*="adsterra"]', 'iframe[src*="propeller"]', 'iframe[src*="popcash"]'
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

export function getAdRemovalScript() {
  return `
(function() {
  const selectors = ${JSON.stringify(AD_SELECTORS)};

  function removeAds() {
    selectors.forEach(function(sel) {
      try {
        document.querySelectorAll(sel).forEach(function(el) {
          el.remove();
        });
      } catch(e) {}
    });

    // إزالة العناصر الثابتة والمشبوهة
    document.querySelectorAll('[style*="position:fixed"],[style*="position: fixed"],[style*="z-index"]').forEach(function(el) {
      var id = (el.id || '').toLowerCase();
      var cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
      if (/ad|banner|popup|modal|overlay|sponsor|promo/.test(id + ' ' + cls)) {
        el.remove();
      }
    });
  }

  removeAds();

  if (document.body) {
    var observer = new MutationObserver(function() {
      removeAds();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  setInterval(removeAds, 1200);

  // منع النوافذ المنبثقة
  window.open = function() { return null; };

  // منع بعض التوجيهات الإعلانية
  document.addEventListener('click', function(e) {
    var target = e.target.closest('a');
    if (target && target.href) {
      var href = target.href.toLowerCase();
      if (/doubleclick|googlesyndication|juicyads|exoclick|popads|adsterra|propeller|popcash/.test(href)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, true);
})();
`;
}

export async function getAdFreeVideo(embedUrl, providerId = 'unknown') {
  if (!embedUrl || embedUrl === '#') return embedUrl;

  const cacheKey = providerId + ':' + embedUrl;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.url;
  }

  try {
    // محاولة استخراج رابط فيديو مباشر من الصفحة
    const html = await fetchHtml(embedUrl);
    if (html) {
      const direct = extractDirectVideo(html);
      if (direct) {
        cache.set(cacheKey, { url: direct, time: Date.now() });
        return direct;
      }
    }

    // إذا فشل الاستخراج نرجع الرابط بعد تنظيف الباراميترات
    const cleaned = cleanUrl(embedUrl);
    cache.set(cacheKey, { url: cleaned, time: Date.now() });
    return cleaned;

  } catch (err) {
    cache.set(cacheKey, { url: embedUrl, time: Date.now() });
    return embedUrl;
  }
}

// تنظيف الكاش كل ساعة
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
