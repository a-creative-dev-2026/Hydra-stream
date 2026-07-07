// ================================================================
// 🛡️ نظام منع الإعلانات المتقدم - 10 طبقات
// ================================================================

// ============================================================
// الطبقة 1: المصادر الموثوقة
// ============================================================
const TRUSTED_SOURCES = [
  'moviesapi.to', 'player.videasy.net', 'vidcore.org',
  'vidsrc.pm', 'vidsrc.me', 'vidsrc.mov', 'vidsrc.wiki', 'vidsrc.sbs'
];

// ============================================================
// الطبقة 2: أنماط الإعلانات (شاملة)
// ============================================================
const AD_PATTERNS = [
  /doubleclick\.net/i, /googleadservices\.com/i, /googlesyndication\.com/i,
  /adservice\.google/i, /adserver\./i, /amazon-adsystem\.com/i,
  /facebook\.com\/tr/i, /taboola\.com/i, /outbrain\.com/i,
  /pubmatic\.com/i, /openx\.net/i, /rubiconproject\.com/i,
  /indexexchange\.com/i, /adnxs\.com/i, /contextweb\.com/i,
  /adform\.net/i, /criteo\.com/i, /bidswitch\.net/i,
  /casalemedia\.com/i, /teads\.tv/i, /adition\.com/i,
  /smartadserver\.com/i, /sovrn\.com/i, /sharethrough\.com/i,
  /sonobi\.com/i, /media\.net/i, /advertising\.com/i,
  /adsystem\.com/i, /adzerk\.net/i, /adnami\.io/i,
  /adobe\.com\/ad/i, /ads\.youtube\.com/i, /pagead2\.googlesyndication\.com/i,
  /banner\./i, /popup\./i, /click2c\./i, /tracking\./i,
  /affiliate\./i, /ad\.js/i, /ads\./i, /sponsor/i,
  /promoted/i, /pagead/i, /pubads/i, /prebid/i,
  /adfox\./i, /adriver\./i, /advert/i, /analytics\./i,
  /beacon\./i, /pixel\./i, /impression\./i, /conversion\./i,
  /retargeting\./i, /remarketing\./i, /video-ads/i,
  /ad-container/i, /ad-wrapper/i, /ad-overlay/i,
  /preroll/i, /midroll/i, /postroll/i, /skip-ad/i,
  /watch-ad/i, /ad-break/i, /advertisement/i,
  /advertising/i, /promo/i, /commercial/i,
  /sponsored/i, /partner/i, /branded/i
];

// ============================================================
// الطبقة 3: محددات HTML للإزالة
// ============================================================
const AD_SELECTORS = [
  '[id*="ad"]', '[class*="ad"]', '[id*="banner"]', '[class*="banner"]',
  '[id*="popup"]', '[class*="popup"]', '[id*="google"]', '[class*="google"]',
  '[id*="doubleclick"]', '[class*="doubleclick"]', '[id*="taboola"]',
  '[class*="taboola"]', '[id*="outbrain"]', '[class*="outbrain"]',
  '[id*="sponsor"]', '[class*="sponsor"]', '[id*="promo"]', '[class*="promo"]',
  '[id*="commercial"]', '[class*="commercial"]', '[id*="advertisement"]',
  '[class*="advertisement"]', '[id*="advertising"]', '[class*="advertising"]',
  '[id*="partner"]', '[class*="partner"]', '[id*="branded"]', '[class*="branded"]',
  '.video-ads', '.ad-container', '.ad-wrapper', '.ad-overlay',
  '.preroll', '.midroll', '.postroll', '.skip-ad', '.ad-break',
  '.ads-box', '.ads-container', '.ad-slot', '.ad-banner',
  '.ad-popup', '.ad-sidebar', '.ad-footer', '.sponsored',
  '.promoted', '.partner-post', '.branded-content',
  'iframe[src*="doubleclick"]', 'iframe[src*="googlead"]',
  'iframe[src*="adserver"]', 'iframe[src*="banner"]',
  'iframe[src*="taboola"]', 'iframe[src*="outbrain"]'
];

// ============================================================
// الطبقة 4: أنماط استخراج الفيديو
// ============================================================
const VIDEO_PATTERNS = [
  /(https?:[^\s<>"']+\.m3u8[^\s<>"']*)/gi,
  /(https?:[^\s<>"']+\.mp4[^\s<>"']*)/gi,
  /(https?:[^\s<>"']+\.ts[^\s<>"']*)/gi,
  /(?:file|videoUrl|src|source)\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4|ts)[^"']*)["']/gi,
  /["'](https?:[^"']+\.(?:m3u8|mp4|ts)[^"']*)["']/gi,
  /source\s*:\s*["'](https?:[^"']+\.m3u8[^"']*)["']/gi,
  /video\s*:\s*["'](https?:[^"']+\.mp4[^"']*)["']/gi,
  /playlist\s*[:=]\s*["']([^"']+\.m3u8[^"']*)["']/gi,
  /manifest\s*[:=]\s*["']([^"']+\.m3u8[^"']*)["']/gi
];

// ============================================================
// الطبقة 5: وكيل عشوائي
// ============================================================
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// ============================================================
// الطبقة 6-10: الأدوات المساعدة والكاش
// ============================================================
const adFreeCache = new Map();
const AD_CACHE_TTL = 30 * 60 * 1000;

const cacheResult = (key, value) => {
  if (adFreeCache.size > 500) {
    const oldestKey = adFreeCache.keys().next().value;
    adFreeCache.delete(oldestKey);
  }
  adFreeCache.set(key, { url: value, timestamp: Date.now() });
};

const getCachedResult = (key) => {
  if (adFreeCache.has(key)) {
    const entry = adFreeCache.get(key);
    if (Date.now() - entry.timestamp < AD_CACHE_TTL) {
      return entry.url;
    }
    adFreeCache.delete(key);
  }
  return null;
};

const cleanUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const paramsToRemove = ['ref', 'utm_source', 'utm_medium', 'utm_campaign', 'click_id', 'tracking', 'ad', 'banner', 'popup', 'affiliate', 'partner', 'campaign', 'source', 'fbclid', 'gclid', 'msclkid', 'dclid', 'click', 'redirect', 'aff', 'subid'];
    paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
    return urlObj.toString();
  } catch { return url; }
};

const containsAds = (url) => {
  if (!url) return true;
  return AD_PATTERNS.some(pattern => pattern.test(url));
};

const extractVideoUrl = (html) => {
  for (const pattern of VIDEO_PATTERNS) {
    const matches = html.match(pattern);
    if (matches) {
      for (const match of matches) {
        const urlMatch = match.match(/(https?:[^\s<>"']+)/i);
        if (urlMatch && urlMatch[1] && urlMatch[1].startsWith('http')) {
          const cleaned = cleanUrl(urlMatch[1]);
          if (!containsAds(cleaned)) return cleaned;
        }
      }
    }
  }
  return null;
};

const extractNestedIframes = (html) => {
  const iframes = [];
  const pattern = /<iframe[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    if (match[1] && match[1].startsWith('http')) {
      iframes.push(match[1]);
    }
  }
  return iframes;
};

// ============================================================
// الوظيفة الرئيسية: 10 طبقات متداخلة
// ============================================================
export const getAdFreeVideo = async (embedUrl, providerId) => {
  const cacheKey = `${providerId}:${embedUrl}`;
  
  // الطبقة 1: الكاش
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;

  // الطبقة 2: المصادر الموثوقة
  if (TRUSTED_SOURCES.some(s => embedUrl.includes(s))) {
    const cleaned = cleanUrl(embedUrl);
    cacheResult(cacheKey, cleaned);
    return cleaned;
  }

  try {
    // الطبقة 3-5: جلب الصفحة بوكيل عشوائي
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'DNT': '1',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      cacheResult(cacheKey, embedUrl);
      return embedUrl;
    }

    const html = await response.text();

    // الطبقة 6: استخراج فيديو مباشر
    const videoUrl = extractVideoUrl(html);
    if (videoUrl) {
      cacheResult(cacheKey, videoUrl);
      return videoUrl;
    }

    // الطبقة 7: البحث في iframes
    const iframes = extractNestedIframes(html);
    for (const iframeUrl of iframes) {
      if (!containsAds(iframeUrl)) {
        try {
          const iframeResponse = await fetch(iframeUrl, {
            headers: { 'User-Agent': getRandomUserAgent(), 'DNT': '1' },
            signal: AbortSignal.timeout(2000)
          });
          if (iframeResponse.ok) {
            const iframeHtml = await iframeResponse.text();
            const iframeVideo = extractVideoUrl(iframeHtml);
            if (iframeVideo) {
              cacheResult(cacheKey, iframeVideo);
              return iframeVideo;
            }
          }
        } catch (e) {}
      }
    }

    // الطبقة 8: تنظيف الرابط
    const cleanedUrl = cleanUrl(embedUrl);
    if (!containsAds(cleanedUrl)) {
      cacheResult(cacheKey, cleanedUrl);
      return cleanedUrl;
    }

    // الطبقة 9: رابط بسيط
    const simpleClean = embedUrl.split('?')[0];
    if (!containsAds(simpleClean)) {
      cacheResult(cacheKey, simpleClean);
      return simpleClean;
    }

    // الطبقة 10: فشل آمن
    cacheResult(cacheKey, embedUrl);
    return embedUrl;

  } catch (error) {
    cacheResult(cacheKey, embedUrl);
    return embedUrl;
  }
};

// تنظيف الكاش
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of adFreeCache) {
    if (now - value.timestamp > AD_CACHE_TTL) {
      adFreeCache.delete(key);
    }
  }
}, 60 * 60 * 1000);

console.log('🛡️ نظام منع الإعلانات المتقدم (10 طبقات) جاهز!');
