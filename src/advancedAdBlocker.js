// ================================================================
// 🛡️ نظام منع الإعلانات المتطور - النسخة النهائية
// ================================================================

// ============================================================
// 📋 الطبقة 1: المصادر الموثوقة (خالية من الإعلانات)
// ============================================================
const TRUSTED_SOURCES = [
  'moviesapi.to',
  'player.videasy.net',
  'vidcore.org',
  'vidsrc.pm',
  'vidsrc.me',
  'vidsrc.mov'
];

// ============================================================
// 📋 الطبقة 2: المصادر التي لا يمكن إزالة إعلاناتها (نتجاوزها)
// ============================================================
const SKIP_SOURCES = [
  'vidsrc.to',    // إعلانات مدمجة في المشغل
  'vidsrc.sbs',   // مشابه لـ vidsrc.to
  'vidsrc.wiki',  // مشابه لـ vidsrc.to
  'vidsrc.top',   // مشابه لـ vidsrc.to
  'vidsrc.ru',    // مشابه لـ vidsrc.to
  'vidfast.vc',   // إعلانات كثيرة
  'streamvaultsrc.click' // إعلانات كثيرة
];

// ============================================================
// 📋 الطبقة 3: أنماط الإعلانات (شاملة جداً)
// ============================================================
const AD_PATTERNS = [
  // شبكات إعلانية كبرى
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
  /adobe\.com\/ad/i, /ads\.youtube\.com/i,
  /pagead2\.googlesyndication\.com/i,
  
  // أنماط عامة
  /banner\./i, /popup\./i, /click2c\./i, /tracking\./i,
  /affiliate\./i, /ad\.js/i, /ads\./i, /sponsor/i,
  /promoted/i, /pagead/i, /pubads/i, /prebid/i,
  /adfox\./i, /adriver\./i, /advert/i, /analytics\./i,
  /beacon\./i, /pixel\./i, /impression\./i,
  /conversion\./i, /retargeting\./i, /remarketing\./i,
  
  // إعلانات الفيديو
  /video-ads/i, /ad-container/i, /ad-wrapper/i,
  /ad-overlay/i, /preroll/i, /midroll/i, /postroll/i,
  /skip-ad/i, /watch-ad/i, /ad-break/i,
  /advertisement/i, /advertising/i, /promo/i,
  /commercial/i, /sponsored/i, /partner/i, /branded/i,
  
  // إضافات
  /juicyads\.com/i, /exoclick\.com/i, /popads\.net/i,
  /adsterra\.com/i, /propellerads\.com/i, /clickadu\.com/i,
  /mgid\.com/i, /revcontent\.com/i, /content\.ad/i,
  /native\.ad/i, /intext/i, /under\.io/i, /voluum/i
];

// ============================================================
// 📋 الطبقة 4: أنماط استخراج الفيديو (أسرع وأدق)
// ============================================================
const VIDEO_PATTERNS = [
  // روابط HLS (.m3u8)
  /(https?:[^\s<>"']+\.m3u8[^\s<>"']*)/gi,
  // روابط MP4 مباشرة
  /(https?:[^\s<>"']+\.mp4[^\s<>"']*)/gi,
  // روابط TS
  /(https?:[^\s<>"']+\.ts[^\s<>"']*)/gi,
  // أنماط JavaScript الشائعة
  /(?:file|videoUrl|src|source|url)\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4|ts)[^"']*)["']/gi,
  /["'](https?:[^"']+\.(?:m3u8|mp4|ts)[^"']*)["']/gi,
  // أنماط JSON
  /["'](https?:[^"']+\.m3u8[^"']*)["']/gi,
  /["'](https?:[^"']+\.mp4[^"']*)["']/gi
];

// ============================================================
// 📋 الطبقة 5: وكيل عشوائي (لتجاوز الحظر)
// ============================================================
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// ============================================================
// 📋 الطبقة 6: ذاكرة تخزين مؤقتة (للتسريع)
// ============================================================
const adFreeCache = new Map();
const AD_CACHE_TTL = 30 * 60 * 1000; // 30 دقيقة

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

// ============================================================
// 📋 الطبقة 7: تنظيف الرابط من معاملات التتبع
// ============================================================
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
  } catch { return url; }
};

// ============================================================
// 📋 الطبقة 8: التحقق من وجود إعلانات
// ============================================================
const containsAds = (url) => {
  if (!url) return true;
  return AD_PATTERNS.some(pattern => pattern.test(url));
};

// ============================================================
// 📋 الطبقة 9: استخراج الفيديو المباشر (أسرع طريقة)
// ============================================================
const extractVideoUrl = (html) => {
  for (const pattern of VIDEO_PATTERNS) {
    const matches = html.match(pattern);
    if (matches) {
      for (const match of matches) {
        const urlMatch = match.match(/(https?:[^\s<>"']+)/i);
        if (urlMatch && urlMatch[1] && urlMatch[1].startsWith('http')) {
          const cleaned = cleanUrl(urlMatch[1]);
          // التأكد من أن الرابط ليس إعلاناً
          if (!containsAds(cleaned) && !cleaned.includes('ad')) {
            return cleaned;
          }
        }
      }
    }
  }
  return null;
};

// ============================================================
// 📋 الطبقة 10: الوظيفة الرئيسية (سريعة وقوية)
// ============================================================
export const getAdFreeVideo = async (embedUrl, providerId) => {
  const cacheKey = `${providerId}:${embedUrl}`;
  
  // 🔹 الطبقة 1: التحقق من الكاش
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;

  // 🔹 الطبقة 2: المصادر الموثوقة (نعيدها مباشرة)
  if (TRUSTED_SOURCES.some(s => embedUrl.includes(s))) {
    const cleaned = cleanUrl(embedUrl);
    cacheResult(cacheKey, cleaned);
    return cleaned;
  }

  // 🔹 الطبقة 3: المصادر التي نتجاوزها (لا نحاول إزالة إعلاناتها)
  if (SKIP_SOURCES.some(s => embedUrl.includes(s))) {
    cacheResult(cacheKey, embedUrl);
    return embedUrl;
  }

  // 🔹 الطبقة 4-10: محاولة استخراج فيديو مباشر
  try {
    // محاولة سريعة (مهلة 2 ثانية)
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'DNT': '1',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(2000)
    });

    if (!response.ok) {
      cacheResult(cacheKey, embedUrl);
      return embedUrl;
    }

    const html = await response.text();
    
    // محاولة استخراج فيديو مباشر
    const videoUrl = extractVideoUrl(html);
    if (videoUrl) {
      cacheResult(cacheKey, videoUrl);
      return videoUrl;
    }

    // محاولة البحث عن iframe متداخل
    const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      try {
        const iframeResponse = await fetch(iframeMatch[1], {
          headers: { 'User-Agent': getRandomUserAgent(), 'DNT': '1' },
          signal: AbortSignal.timeout(1500)
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

    // إذا لم نجد فيديو مباشر، نعيد الرابط الأصلي
    cacheResult(cacheKey, embedUrl);
    return embedUrl;

  } catch (error) {
    // في حالة الفشل، نعيد الرابط الأصلي (سرعة)
    cacheResult(cacheKey, embedUrl);
    return embedUrl;
  }
};

// تنظيف الكاش كل ساعة
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of adFreeCache) {
    if (now - value.timestamp > AD_CACHE_TTL) {
      adFreeCache.delete(key);
    }
  }
}, 60 * 60 * 1000);

console.log('🛡️ نظام منع الإعلانات المتطور جاهز (سريع وقوي)');
