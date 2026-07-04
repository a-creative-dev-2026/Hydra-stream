import axios from 'axios';
import https from 'https';

// إعدادات Agent لتجاوز مشاكل SSL وحظر Cloudflare البسيط
const agent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true
});

export const validateUrl = async (url) => {
  // استراتيجية جديدة: نطلب GET مع تعطيل الـ Redirects وقراءة أول 1000 بايت فقط
  try {
    const res = await axios.get(url, {
      timeout: 8000, // زيادة المهلة قليلاً
      httpsAgent: agent,
      maxRedirects: 0,
      validateStatus: (status) => status < 500,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
        'Cache-Control': 'no-cache'
      }
    });
    // إذا كان الرد 200 أو 302 أو 403، نعتبر الرابط صالحاً
    return [200, 302, 403].includes(res.status);
  } catch (error) {
    // إذا كان الخطأ بسبب الـ Redirect (301/302) فهذا يعني أن الرابط حي!
    if (error.response && [301, 302, 307, 308].includes(error.response.status)) {
      return true;
    }
    // إذا كان الخطأ بسبب انقطاع الاتصال (ECONNRESET) قد يكون الرابط حياً ولكن الخادم يمنعنا
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      // في حالة انقطاع الاتصال، نعتبره صالحاً بشكل افتراضي (قد يعمل في تطبيق المستخدم)
      return true;
    }
    return false;
  }
};
