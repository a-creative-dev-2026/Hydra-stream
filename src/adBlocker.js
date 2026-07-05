// ============================================================
// ملف منع الإعلانات - يعمل على الخادم
// ============================================================

// قائمة بأنماط الإعلانات
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

// رؤوس HTTP لتجنب الحظر
const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
    'DNT': '1',
    'Cache-Control': 'no-cache'
};

// ذاكرة تخزين مؤقتة للنتائج
const adFreeCache = new Map();
const CACHE_TTL = 600000; // 10 دقائق

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
        const paramsToRemove = ['ref', 'utm_source', 'tracking', 'ad', 'banner', 'click_id'];
        paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
        return urlObj.toString();
    } catch {
        return url;
    }
};

/**
 * محاولة استخراج فيديو مباشر (بدون إعلانات)
 */
export const blockAds = async (embedUrl) => {
    // التحقق من الكاش
    if (adFreeCache.has(embedUrl)) {
        const cached = adFreeCache.get(embedUrl);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.url;
        }
    }

    try {
        const response = await fetch(embedUrl, {
            headers: FETCH_HEADERS,
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) return embedUrl;

        const html = await response.text();

        // البحث عن روابط الفيديو المباشرة
        const patterns = [
            /(https?:[^\s"']+\.m3u8[^\s"']*)/i,
            /(https?:[^\s"']+\.mp4[^\s"']*)/i,
            /file\s*[:=]\s*["'](https?:[^"']+)["']/i,
            /videoUrl\s*[:=]\s*["'](https?:[^"']+)["']/i
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1] && match[1].startsWith('http')) {
                const directUrl = cleanUrl(match[1]);
                if (!containsAds(directUrl)) {
                    adFreeCache.set(embedUrl, { url: directUrl, timestamp: Date.now() });
                    return directUrl;
                }
            }
        }

        return embedUrl;

    } catch (error) {
        return embedUrl;
    }
};

export const getAdFreeVideo = async (embedUrl) => {
    try {
        return await blockAds(embedUrl);
    } catch {
        return embedUrl;
    }
};
