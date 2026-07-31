// ================================================================
// 🛡️ سيرفر وسيط Pro Max - نسخة محسنة ضد الحجب
// ================================================================

import express from 'express';
import { getAdRemovalScript } from './advancedAdBlocker.js';

const router = express.Router();

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

router.get('/proxy', async (req, res) => {
  const target = req.query.url;

  if (!target) {
    return res.status(400).json({
      success: false,
      error: 'الباراميتر url مطلوب',
      example: '/api/proxy?url=https://vidsrc.pm/embed/movie/tt1375666'
    });
  }

  try {
    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      return res.status(400).json({ success: false, error: 'الرابط غير صالح' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(target, {
      method: 'GET',
      headers: {
        'User-Agent': getRandomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': targetUrl.origin + '/',
        'Origin': targetUrl.origin,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      },
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `فشل جلب الصفحة (كود: ${response.status})`,
        target: target
      });
    }

    let html = await response.text();

    // تنظيف الإعلانات
    html = html
      .replace(/<script[^>]*(ads|doubleclick|googlesyndication|taboola|outbrain|juicyads|exoclick|popads|adsterra|propeller|popcash|adcash)[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*(doubleclick|googlesyndication|adservice|taboola|outbrain|juicyads|exoclick|popads|adsterra|propeller|banner|popup)[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<div[^>]*(id|class)=["'][^"']*(ad-|ads-|banner|popup|sponsor|promo|overlay)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

    // حقن سكربت الإزالة
    const script = `<script>${getAdRemovalScript()}</script>`;
    if (html.includes('</body>')) {
      html = html.replace('</body>', script + '</body>');
    } else {
      html += script;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.send(html);

  } catch (err) {
    console.error('Proxy Error:', err.message);

    // رسالة خطأ أوضح
    let message = 'فشل في جلب المصدر';
    if (err.name === 'AbortError') {
      message = 'انتهت مهلة الاتصال بالمصدر (Timeout)';
    } else if (err.message.includes('fetch')) {
      message = 'المصدر يرفض الاتصال من السيرفر (محمي أو محجوب)';
    }

    res.status(500).json({
      success: false,
      error: message,
      details: err.message,
      tip: 'جرب مصدر آخر أو انتظر قليلاً ثم أعد المحاولة'
    });
  }
});

export default router;
