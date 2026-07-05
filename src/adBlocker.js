// ================================================================
// ملف قوي وسريع لمحاولة منع الإعلانات من مصادر البث
// ================================================================

// إعدادات الأداء
const CONFIG = {
    TIMEOUT_MS: 2500,            // 2.5 ثانية مهلة (سرعة)
    MAX_RETRIES: 1,              // محاولة واحدة فقط (لا نضيع وقت)
    CACHE_TTL: 600000            // 10 دقائق تخزين
};

// أنماط الإعلانات (للكشف السريع)
const AD_PATTERNS = [
    /doubleclick\.net/i,
    /googleadservices\.com/i,
    /googlesyndication\.com/i,
    /adservice\.google/i,
    /adserver\./i,
    /banner\./i,
    /popup\./i,
    /click2c\./i,
    /tracking\./i,
    /affiliate\./i,
    /ad\.js/i,
    /ads\./i,
    /sponsor/i,
    /promoted/i,
    /pagead/i,
    /pubads/i,
    /prebid/i
];

// رؤوس HTTP لتجنب الحظر
const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'DNT': '1',
    'Cache-Control': 'no-cache'
};

// ذاكرة تخزين مؤقتة للنتائج (لتسريع الطلبات المتكررة)
const adFreeCache = new Map();

/**
 * التحقق مما إذا كان الرابط يحتوي على إعلانات
 */
const containsAds = (url) => {
    if (!url) return true;
    return AD_PATTERNS.some(pattern => pattern.test(url));
};

/**
 * تنظيف الرابط من معاملات التتبع والإعلانات
 */
const cleanUrl = (url) => {
    try {
        const urlObj = new URL(url);
        const paramsToRemove = [
            'ref', 'utm_source', 'utm_medium', 'utm_campaign',
            'click_id', 'tracking', 'ad', 'banner', 'popup',
            'affiliate', 'partner', 'campaign', 'source',
            'fbclid', 'gclid', 'msclkid', 'dclid', 'reddit'
        ];
        paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
        return urlObj.toString();
    } catch {
        return url;
    }
};

/**
 * محاولة إزالة الإعلانات من الرابط (الواجهة الرئيسية)
 * تعمل بسرعة وتحاول بقوة منع الإعلانات
 */
export const blockAds = async (embedUrl) => {
    // 1. التحقق من الكاش السريع
    if (adFreeCache.has(embedUrl)) {
        const cached = adFreeCache.get(embedUrl);
        if (Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
            console.log(`⚡ من الكاش: ${embedUrl}`);
            return cached.url;
        }
    }

    console.log(`🛡️ محاولة منع الإعلانات: ${embedUrl}`);

    try {
        // 2. جلب الصفحة مع مهلة قصيرة جداً
        const response = await fetch(embedUrl, {
            headers: FETCH_HEADERS,
            signal: AbortSignal.timeout(CONFIG.TIMEOUT_MS)
        });

        if (!response.ok) {
            console.warn(`⚠️ فشل الجلب (HTTP ${response.status})، إعادة الرابط الأصلي`);
            return embedUrl;
        }

        const html = await response.text();
        
        // 3. البحث عن روابط الفيديو المباشرة (.m3u8, .mp4)
        // نبحث عن أي رابط يبدو أنه فيديو
        const videoPatterns = [
            /(https?:[^\s<>"']+\.m3u8[^\s<>"']*)/gi,
            /(https?:[^\s<>"']+\.mp4[^\s<>"']*)/gi,
            /(https?:[^\s<>"']+\.ts[^\s<>"']*)/gi,
            /(?:file|videoUrl|src|source)\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4|ts)[^"']*)["']/gi,
            /["'](https?:[^"']+\.(?:m3u8|mp4|ts)[^"']*)["']/gi
        ];

        let directUrl = null;
        for (const pattern of videoPatterns) {
            const match = html.match(pattern);
            if (match) {
                // نأخذ أول رابط صحيح
                const found = match[1] || match[0];
                if (found && found.startsWith('http')) {
                    directUrl = found;
                    break;
                }
            }
        }

        // 4. إذا وجدنا رابطاً مباشراً، ننظفه ونتحقق من خلوه من الإعلانات
        if (directUrl) {
            const cleaned = cleanUrl(directUrl);
            if (!containsAds(cleaned)) {
                // تخزين في الكاش
                adFreeCache.set(embedUrl, {
                    url: cleaned,
                    timestamp: Date.now()
                });
                console.log(`✅ تم الحصول على فيديو خالٍ من الإعلانات: ${cleaned}`);
                return cleaned;
            }
        }

        // 5. إذا لم نجد رابطاً مباشراً أو كان يحتوي على إعلانات، نعيد الرابط الأصلي
        console.warn('⚠️ لم نتمكن من إزالة الإعلانات، إعادة الرابط الأصلي');
        return embedUrl;

    } catch (error) {
        // 6. في حالة أي خطأ (مهلة، شبكة، إلخ) نعيد الرابط الأصلي فوراً
        console.warn(`⚠️ فشل منع الإعلانات: ${error.message}`);
        return embedUrl;
    }
};

/**
 * دالة سريعة للاستخدام في cache.js
 */
export const getAdFreeVideo = async (embedUrl) => {
    try {
        return await blockAds(embedUrl);
    } catch {
        return embedUrl; // في حالة الفشل، نعيد الرابط الأصلي
    }
};

// تنظيف الكاش كل ساعة
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of adFreeCache) {
        if (now - value.timestamp > CONFIG.CACHE_TTL) {
            adFreeCache.delete(key);
        }
    }
}, CONFIG.CACHE_TTL);
