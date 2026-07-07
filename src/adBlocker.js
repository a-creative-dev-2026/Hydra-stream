// ================================================================
// 🛡️ نظام منع الإعلانات المتقدم - 5 طبقات
// ================================================================

// ============================================================
// الطبقة 1: قائمة المصادر الموثوقة (خالية من الإعلانات)
// ============================================================
const TRUSTED_SOURCES = [
  'moviesapi.to',
  'player.videasy.net',
  'vidcore.org',
  'vidsrc.pm',
  'vidsrc.me'
];

// ============================================================
// الطبقة 2: أنماط الإعلانات (شاملة)
// ============================================================
const AD_PATTERNS = [
  /doubleclick\.net/i, /googleadservices\.com/i, /googlesyndication\.com/i,
  /adservice\.google/i, /adserver\./i, /banner\./i, /popup\./i,
  /tracking\./i, /ads\./i, /sponsor/i, /pagead/i, /pubads/i,
  /prebid/i, /amazon-adsystem\.com/i, /facebook\.com\/tr/i,
  /taboola\.com/i, /outbrain\.com/i, /pubmatic\.com/i,
  /openx\.net/i, /rubiconproject\.com/i, /indexexchange\.com/i,
  /adnxs\.com/i, /contextweb\.com/i, /adform\.net/i,
  /criteo\.com/i, /bidswitch\.net/i, /casalemedia\.com/i,
  /teads\.tv/i, /adition\.com/i, /smartadserver\.com/i,
  /sovrn\.com/i, /sharethrough\.com/i, /sonobi\.com/i,
  /media\.net/i, /advertising\.com/i, /adsystem\.com/i,
  /adzerk\.net/i, /adnami\.io/i, /adobe\.com\/ad/i,
  /ads\.youtube\.com/i, /pagead2\.googlesyndication\.com/i,
  /adfox\./i, /adriver\./i, /advert/i, /analytics\./i,
  /video-ads/i, /ad-container/i, /ad-wrapper/i, /ad-overlay/i,
  /preroll/i, /midroll/i, /postroll/i, /skip-ad/i,
  /ad-break/i, /advertisement/i, /advertising/i, /promo/i,
  /commercial/i, /sponsored/i, /partner/i, /branded/i
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
  '.promoted', '.partner-post', '.branded-content'
];

// ============================================================
// الطبقة 4: استخراج الفيديو المباشر
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
// الطبقة 5: وكيل ذكي (تجاوز الحظر)
// ============================================================
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// ============================================================
// الوظائف الرئيسية
// ============================================================

/**
 * تنظيف الرابط من معاملات التتبع
 */
const cleanUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const paramsToRemove = [
      'ref', 'utm_source', 'utm_medium', 'utm_campaign',
      'click_id', 'tracking', 'ad', 'banner', 'popup',
      'affiliate', 'partner', 'campaign', 'source',
      'fbclid', 'gclid', 'msclkid', 'dclid',
      'click', 'redirect', 'aff', 'subid'
    ];
    paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
    return urlObj.toString();
  } catch {
    return url;
  }
};

/**
 * التحقق مما إذا كان الرابط يحتوي على إعلانات
 */
const containsAds = (url) => {
  if (!url) return true;
  return AD_PATTERNS.some(pattern => pattern.test(url));
};

/**
 * استخراج فيديو مباشر من HTML
 */
const extractVideoUrl = (html) => {
  for (const pattern of VIDEO_PATTERNS) {
    const matches = html.match(pattern);
    if (matches) {
      for (const match of matches) {
        const urlMatch = match.match(/(https?:[^\s<>"']+)/i);
        if (urlMatch && urlMatch[1] && urlMatch[1].startsWith('http')) {
          const cleaned = cleanUrl(urlMatch[1]);
          if (!containsAds(cleaned)) {
            return cleaned;
          }
        }
      }
    }
  }
  return null;
};

/**
 * استخراج iframes متداخلة
 */
const extractIframes = (html) => {
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

/**
 * جلب الصفحة مع محاولات متعددة
 */
const fetchPage = async (url, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
          'Accept-Language': 'en-US,en;q=0.9',
          'DNT': '1',
          'Cache-Control': 'no-cache'
        },
        signal: AbortSignal.timeout(5000 + (attempt * 1000))
      });

      if (response.ok) {
        return await response.text();
      }
    } catch (e) {
      console.log(`🔄 محاولة ${attempt + 1} فشلت، إعادة المحاولة...`);
      await new Promise(r => setTimeout(r, 500 + (attempt * 500)));
    }
  }
  return null;
};

/**
 * الوظيفة الرئيسية: محاولة الحصول على فيديو خالٍ من الإعلانات
 */
export const getAdFreeVideo = async (embedUrl, providerId) => {
  console.log(`🛡️ محاولة منع الإعلانات: ${providerId}`);

  // 1. التحقق من المصادر الموثوقة
  if (TRUSTED_SOURCES.some(s => embedUrl.includes(s))) {
    console.log(`✅ مصدر موثوق (خالٍ من الإعلانات): ${embedUrl}`);
    return cleanUrl(embedUrl);
  }

  try {
    // 2. جلب الصفحة
    const html = await fetchPage(embedUrl);
    if (!html) return embedUrl;

    // 3. محاولة استخراج فيديو مباشر
    const videoUrl = extractVideoUrl(html);
    if (videoUrl) {
      console.log(`✅ تم استخراج فيديو مباشر (بدون إعلانات): ${videoUrl}`);
      return videoUrl;
    }

    // 4. البحث في iframes المتداخلة
    const iframes = extractIframes(html);
    for (const iframeUrl of iframes) {
      const iframeHtml = await fetchPage(iframeUrl);
      if (iframeHtml) {
        const iframeVideo = extractVideoUrl(iframeHtml);
        if (iframeVideo) {
          console.log(`✅ تم استخراج فيديو من iframe: ${iframeVideo}`);
          return iframeVideo;
        }
      }
    }

    // 5. إذا فشل كل شيء، نعيد الرابط الأصلي مع تنظيفه
    console.warn(`⚠️ لم نتمكن من إزالة الإعلانات، إعادة الرابط الأصلي`);
    return cleanUrl(embedUrl);

  } catch (error) {
    console.warn(`⚠️ فشل منع الإعلانات: ${error.message}`);
    return embedUrl;
  }
};

// ============================================================
// تصدير الدوال للاستخدام الخارجي
// ============================================================
export default {
  getAdFreeVideo,
  cleanUrl,
  containsAds,
  TRUSTED_SOURCES
};
