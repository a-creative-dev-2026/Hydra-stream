// ============================================================
// ملف محاولة تقليل الإعلانات واستخراج الفيديو المباشر
// ============================================================

/**
 * محاولة استخراج رابط الفيديو المباشر من صفحة المصدر
 * @param {string} embedUrl - رابط التضمين الأصلي
 * @returns {Promise<string>} رابط الفيديو المباشر أو الرابط الأصلي
 */
export const extractDirectVideo = async (embedUrl) => {
  try {
    console.log(`🔍 جاري محاولة استخراج الفيديو من: ${embedUrl}`);

    // 1. جلب صفحة المصدر
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(8000) // مهلة 8 ثوانٍ
    });

    if (!response.ok) {
      console.warn(`⚠️ فشل جلب الصفحة: ${response.status}`);
      return embedUrl;
    }

    const html = await response.text();

    // 2. أنماط البحث عن روابط الفيديو المباشرة
    const patterns = [
      // روابط .m3u8 (HLS)
      /(https?:[^\s"']+\.m3u8[^\s"']*)/i,
      // روابط .mp4 مباشرة
      /(https?:[^\s"']+\.mp4[^\s"']*)/i,
      // أنماط JavaScript الشائعة
      /['"](https?:[^"']+\.(?:m3u8|mp4)[^"']*)['"]/i,
      /file\s*[:=]\s*['"](https?:[^"']+)['"]/i,
      /videoUrl\s*[:=]\s*['"](https?:[^"']+)['"]/i,
      /source\s*[:=]\s*['"](https?:[^"']+)['"]/i,
      /src\s*[:=]\s*['"](https?:[^"']+\.(?:m3u8|mp4)[^"']*)['"]/i,
      // أنماط JSON
      /["'](https?:[^"']+\.m3u8[^"']*)["']/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const directUrl = match[1];
        // تأكد من أن الرابط يبدو صالحاً
        if (directUrl.startsWith('http')) {
          console.log(`✅ تم استخراج فيديو مباشر: ${directUrl}`);
          return directUrl;
        }
      }
    }

    // 3. البحث عن iframe آخر (بعض المواقع تضمين متداخل)
    const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      const nestedUrl = iframeMatch[1];
      if (nestedUrl !== embedUrl && nestedUrl.startsWith('http')) {
        console.log(`🔄 محاولة استخراج من iframe متداخل: ${nestedUrl}`);
        // استدعاء متكرر للـ iframe المتداخل (مرة واحدة فقط)
        return await extractDirectVideo(nestedUrl);
      }
    }

    // 4. إذا لم نجد رابطاً مباشراً، نعيد الرابط الأصلي
    console.log('⚠️ لم يتم العثور على فيديو مباشر، إعادة الرابط الأصلي');
    return embedUrl;

  } catch (error) {
    console.error(`❌ فشل استخراج الفيديو: ${error.message}`);
    return embedUrl; // إعادة الرابط الأصلي كخطة احتياطية
  }
};

/**
 * محاولة تنقية الرابط من الإعلانات (إزالة معاملات التتبع)
 */
export const cleanUrl = (url) => {
  try {
    const urlObj = new URL(url);
    // إزالة معاملات التتبع الشائعة
    const trackingParams = ['ref', 'utm_source', 'utm_medium', 'utm_campaign', 'click_id', 'tracking'];
    for (const param of trackingParams) {
      urlObj.searchParams.delete(param);
    }
    return urlObj.toString();
  } catch {
    return url;
  }
};
