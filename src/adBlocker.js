// ============================================================
// محاولة سريعة لاستخراج الفيديو المباشر (بحد أقصى 1.5 ثانية)
// ============================================================

/**
 * محاولة سريعة لاستخراج الفيديو المباشر
 * إذا نجحت خلال 1.5 ثانية → تعيد الرابط المباشر (بدون إعلانات)
 * إذا فشلت → تعيد الرابط الأصلي فوراً
 */
export const extractDirectVideo = async (embedUrl) => {
  // مهلة قصيرة جداً (1.5 ثانية) للحفاظ على السرعة
  const TIMEOUT_MS = 1500;
  
  try {
    console.log(`⚡ محاولة سريعة لاستخراج الفيديو من: ${embedUrl}`);

    // استخدام Promise.race لمنافسة المهلة مع عملية الجلب
    const result = await Promise.race([
      // المحاولة الفعلية لاستخراج الفيديو
      tryExtract(embedUrl),
      // مهلة 1.5 ثانية
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت المهلة (1.5 ثانية)')), TIMEOUT_MS)
      )
    ]);

    // إذا وصلنا هنا، فهذا يعني أن الاستخراج نجح خلال المهلة
    if (result && result.startsWith('http')) {
      console.log(`✅ تم استخراج فيديو مباشر خلال ${TIMEOUT_MS}ms`);
      return result;
    }
    
    console.log('⚠️ لم يتم العثور على فيديو مباشر، إعادة الرابط الأصلي');
    return embedUrl;

  } catch (error) {
    // في حالة فشل الاستخراج أو انتهاء المهلة، نعيد الرابط الأصلي فوراً
    console.log(`⏱️ انتهت المهلة أو فشل الاستخراج، إعادة الرابط الأصلي (${error.message})`);
    return embedUrl;
  }
};

/**
 * دالة الاستخراج الفعلية (بدون مهلة)
 */
const tryExtract = async (embedUrl) => {
  try {
    // جلب الصفحة مع طلب سريع
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      // لا نستخدم AbortSignal هنا لأننا نتحكم بالمهلة من الخارج
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // أنماط البحث عن روابط الفيديو المباشرة
    const patterns = [
      /(https?:[^\s"']+\.m3u8[^\s"']*)/i,
      /(https?:[^\s"']+\.mp4[^\s"']*)/i,
      /file\s*[:=]\s*["'](https?:[^"']+)["']/i,
      /videoUrl\s*[:=]\s*["'](https?:[^"']+)["']/i,
      /source\s*[:=]\s*["'](https?:[^"']+)["']/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].startsWith('http')) {
        return match[1];
      }
    }

    // إذا لم نجد، نلقي خطأ ليعود إلى الرابط الأصلي
    throw new Error('لم يتم العثور على رابط فيديو مباشر');

  } catch (error) {
    // نعيد طرح الخطأ ليعالجه المستوى الأعلى
    throw error;
  }
};
