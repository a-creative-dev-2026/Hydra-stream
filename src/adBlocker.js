// ================================================================
// 🛡️ ملف منع الإعلانات - باستخدام روابط مباشرة للمصادر
// ================================================================

// ============================================================
// 1. روابط مباشرة للمصادر (محاولة منع الإعلانات)
// ============================================================
const DIRECT_SOURCES = {
    // المصادر التي تقدم فيديو مباشر (خالية من الإعلانات تقريباً)
    'moviesapi': {
        label: 'MoviesAPI',
        directUrl: (params) => {
            if (params.type === 'movie') {
                return `https://moviesapi.to/movie/${params.id}`;
            } else if (params.type === 'tv') {
                return `https://moviesapi.to/tv/${params.id}/${params.season}/${params.episode}`;
            }
            return null;
        }
    },
    'videasy': {
        label: 'Videasy',
        directUrl: (params) => {
            if (params.type === 'movie') {
                return `https://player.videasy.net/movie/${params.id}`;
            } else if (params.type === 'tv') {
                return `https://player.videasy.net/tv/${params.id}`;
            }
            return null;
        }
    },
    'vidcore': {
        label: 'VidCore',
        directUrl: (params) => {
            if (params.type === 'movie') {
                return `https://www.vidcore.org/embed/movie/${params.id}`;
            } else if (params.type === 'tv') {
                return `https://www.vidcore.org/embed/tv/${params.id}/${params.season}/${params.episode}`;
            }
            return null;
        }
    },

    // ===== المصادر التي قد تحتوي إعلانات (محاولة استخراج مباشر) =====
    'vidsrc.pm': {
        label: 'VidSrc.pm',
        directUrl: (params) => {
            // محاولة استخدام صيغة مباشرة (قد لا تعمل دائماً)
            if (params.type === 'movie') {
                return `https://vidsrc.pm/embed/movie/${params.id}`;
            } else if (params.type === 'tv') {
                return `https://vidsrc.pm/embed/tv/${params.id}/${params.season}/${params.episode}`;
            }
            return null;
        }
    },
    'vidsrc.to': {
        label: 'VidSrc.to',
        directUrl: (params) => {
            if (params.type === 'movie') {
                return `https://vidsrc.to/embed/movie/${params.id}`;
            } else if (params.type === 'tv') {
                return `https://vidsrc.to/embed/tv/${params.id}/${params.season}/${params.episode}`;
            }
            return null;
        }
    },
    'vidsrc.me': {
        label: 'VidSrc.me',
        directUrl: (params) => {
            if (params.type === 'movie') {
                return `https://vidsrc.me/embed/movie/${params.id}`;
            } else if (params.type === 'tv') {
                return `https://vidsrc.me/embed/tv/${params.id}/${params.season}/${params.episode}`;
            }
            return null;
        }
    },
    'vidsrc.mov': {
        label: 'VidSrc.mov',
        directUrl: (params) => {
            if (params.type === 'movie') {
                return `https://vidsrc.mov/embed/movie/${params.id}`;
            } else if (params.type === 'tv') {
                return `https://vidsrc.mov/embed/tv/${params.id}/${params.season}/${params.episode}`;
            }
            return null;
        }
    }
};

// ============================================================
// 2. أنماط الإعلانات (للتحقق الاحتياطي)
// ============================================================
const AD_PATTERNS = [
    /doubleclick\.net/i,
    /googleadservices\.com/i,
    /googlesyndication\.com/i,
    /adservice\.google/i,
    /adserver\./i,
    /banner\./i,
    /popup\./i,
    /tracking\./i,
    /ads\./i,
    /sponsor/i,
    /pagead/i,
    /pubads/i,
    /prebid/i
];

// ============================================================
// 3. ذاكرة تخزين مؤقتة
// ============================================================
const directCache = new Map();
const CACHE_TTL = 600000; // 10 دقائق

// ============================================================
// 4. وظائف مساعدة
// ============================================================

/**
 * التحقق مما إذا كان الرابط يحتوي على إعلانات
 */
const containsAds = (url) => {
    if (!url) return true;
    return AD_PATTERNS.some(pattern => pattern.test(url));
};

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
            'fbclid', 'gclid', 'msclkid', 'dclid'
        ];
        paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
        return urlObj.toString();
    } catch {
        return url;
    }
};

/**
 * محاولة استخراج فيديو مباشر من صفحة المصدر (كحل أخير)
 */
const extractFromPage = async (embedUrl) => {
    try {
        const response = await fetch(embedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
                'DNT': '1',
                'Cache-Control': 'no-cache'
            },
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) return null;

        const html = await response.text();
        const patterns = [
            /(https?:[^\s<>"']+\.m3u8[^\s<>"']*)/gi,
            /(https?:[^\s<>"']+\.mp4[^\s<>"']*)/gi,
            /(?:file|videoUrl|src|source)\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4|ts)[^"']*)["']/gi,
            /["'](https?:[^"']+\.(?:m3u8|mp4|ts)[^"']*)["']/gi
        ];

        for (const pattern of patterns) {
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
    } catch {
        return null;
    }
};

// ============================================================
// 5. الوظيفة الرئيسية (باستخدام الروابط المباشرة)
// ============================================================

export const blockAds = async (embedUrl, providerId, params) => {
    // 1. التحقق من الكاش
    const cacheKey = `${providerId}:${embedUrl}`;
    if (directCache.has(cacheKey)) {
        const cached = directCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`⚡ من الكاش (مباشر): ${cached.url}`);
            return cached.url;
        }
    }

    console.log(`🛡️ محاولة منع الإعلانات: ${providerId} - ${embedUrl}`);

    // 2. البحث عن رابط مباشر معروف للمصدر
    const source = DIRECT_SOURCES[providerId];
    if (source && source.directUrl) {
        const directUrl = source.directUrl(params);
        if (directUrl) {
            const cleaned = cleanUrl(directUrl);
            if (!containsAds(cleaned)) {
                // تخزين في الكاش
                directCache.set(cacheKey, {
                    url: cleaned,
                    timestamp: Date.now()
                });
                console.log(`✅ رابط مباشر معروف (خالٍ من الإعلانات): ${cleaned}`);
                return cleaned;
            }
        }
    }

    // 3. إذا لم يكن هناك رابط مباشر معروف، نحاول استخراج فيديو من الصفحة
    console.log(`🔄 محاولة استخراج فيديو من الصفحة: ${embedUrl}`);
    const extracted = await extractFromPage(embedUrl);
    if (extracted) {
        directCache.set(cacheKey, {
            url: extracted,
            timestamp: Date.now()
        });
        console.log(`✅ تم استخراج فيديو مباشر: ${extracted}`);
        return extracted;
    }

    // 4. إذا فشل كل شيء، نعيد الرابط الأصلي
    console.warn(`⚠️ لم نتمكن من إزالة الإعلانات، إعادة الرابط الأصلي: ${embedUrl}`);
    directCache.set(cacheKey, {
        url: embedUrl,
        timestamp: Date.now()
    });
    return embedUrl;
};

/**
 * دالة سريعة للاستخدام في cache.js
 */
export const getAdFreeVideo = async (embedUrl, providerId, params) => {
    try {
        return await blockAds(embedUrl, providerId, params);
    } catch {
        return embedUrl;
    }
};

// تنظيف الكاش كل ساعة
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of directCache) {
        if (now - value.timestamp < CACHE_TTL) continue;
        directCache.delete(key);
    }
    console.log(`🧹 تم تنظيف الكاش (${directCache.size} عنصر متبقي)`);
}, 60000);

console.log('🛡️ نظام منع الإعلانات (بالروابط المباشرة) جاهز!');
