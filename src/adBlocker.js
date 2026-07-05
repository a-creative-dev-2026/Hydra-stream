// ================================================================
// 🛡️ أقوى نظام لمنع الإعلانات - النسخة النهائية v4.0
// ================================================================

// 1. المصادر السبعة (القائمة البيضاء)
const WHITELIST = [
    'moviesapi.to',
    'player.videasy.net',
    'vidcore.org',
    'vidsrc.pm',
    'vidsrc.to',
    'vidsrc.me',
    'vidsrc.mov'
];

// 2. أنماط الإعلانات (شاملة جداً)
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
    /ads\.youtube\.com/i, /pagead2\.googlesyndication\.com/i
];

// 3. إعدادات وكيل قوية
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// 4. استخراج الروابط المباشرة (أنماط متعددة)
const VIDEO_PATTERNS = [
    /(https?:[^\s<>"']+\.m3u8[^\s<>"']*)/gi,
    /(https?:[^\s<>"']+\.mp4[^\s<>"']*)/gi,
    /(?:file|videoUrl|src|source)\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4|ts)[^"']*)["']/gi,
    /["'](https?:[^"']+\.(?:m3u8|mp4|ts)[^"']*)["']/gi,
    /source\s*:\s*["'](https?:[^"']+\.m3u8[^"']*)["']/gi,
    /video\s*:\s*["'](https?:[^"']+\.mp4[^"']*)["']/gi
];

const extractVideoUrls = (html) => {
    const urls = [];
    for (const pattern of VIDEO_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            for (const match of matches) {
                const urlMatch = match.match(/(https?:[^\s<>"']+)/i);
                if (urlMatch && urlMatch[1] && urlMatch[1].startsWith('http')) {
                    urls.push(urlMatch[1]);
                }
            }
        }
    }
    return [...new Set(urls)];
};

// 5. أدوات مساعدة
const getDomain = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return null;
    }
};

const isWhitelisted = (url) => {
    const domain = getDomain(url);
    return domain ? WHITELIST.some(w => domain.includes(w)) : false;
};

const containsAds = (url) => {
    if (!url) return true;
    return AD_PATTERNS.some(pattern => pattern.test(url));
};

const cleanUrl = (url) => {
    try {
        const urlObj = new URL(url);
        const paramsToRemove = ['ref', 'utm_source', 'tracking', 'ad', 'banner', 'click_id', 'fbclid', 'gclid'];
        paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
        return urlObj.toString();
    } catch {
        return url;
    }
};

// 6. ذاكرة تخزين مؤقتة
const cache = new Map();
const CACHE_TTL = 600000; // 10 دقائق

// 7. الوظيفة الرئيسية
export const blockAds = async (embedUrl, providerId, params) => {
    const cacheKey = `${providerId}:${embedUrl}`;
    
    // التحقق من الكاش
    if (cache.has(cacheKey)) {
        const entry = cache.get(cacheKey);
        if (Date.now() - entry.timestamp < CACHE_TTL) {
            console.log(`⚡ من الكاش: ${entry.url}`);
            return entry.url;
        }
    }

    console.log(`🛡️ محاولة منع الإعلانات: ${providerId}`);

    // إذا كان المصدر في القائمة البيضاء، نثق به
    if (isWhitelisted(embedUrl)) {
        const cleaned = cleanUrl(embedUrl);
        cache.set(cacheKey, { url: cleaned, timestamp: Date.now() });
        console.log(`✅ مصدر موثوق: ${cleaned}`);
        return cleaned;
    }

    // محاولة استخراج فيديو مباشر
    try {
        const response = await fetch(embedUrl, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
                'DNT': '1',
                'Cache-Control': 'no-cache'
            },
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const html = await response.text();
        const videoUrls = extractVideoUrls(html);

        for (const url of videoUrls) {
            const cleaned = cleanUrl(url);
            if (!containsAds(cleaned) && cleaned.startsWith('http')) {
                cache.set(cacheKey, { url: cleaned, timestamp: Date.now() });
                console.log(`✅ فيديو خالٍ من الإعلانات: ${cleaned}`);
                return cleaned;
            }
        }

        // إذا فشل، نعيد الرابط الأصلي
        console.warn(`⚠️ لم نتمكن من إزالة الإعلانات`);
        cache.set(cacheKey, { url: embedUrl, timestamp: Date.now() });
        return embedUrl;

    } catch (error) {
        console.warn(`⚠️ فشل: ${error.message}`);
        cache.set(cacheKey, { url: embedUrl, timestamp: Date.now() });
        return embedUrl;
    }
};

export const getAdFreeVideo = async (embedUrl, providerId, params) => {
    try {
        return await blockAds(embedUrl, providerId, params);
    } catch {
        return embedUrl;
    }
};

// تنظيف الكاش
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache) {
        if (now - value.timestamp > CACHE_TTL) cache.delete(key);
    }
}, 60000);

console.log('🛡️ نظام منع الإعلانات النهائي جاهز!');
