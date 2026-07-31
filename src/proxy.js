// ================================================================
// 🛡️ Proxy Pro Max - أقوى تنظيف إعلانات ممكن بدون كسر المشغل
// ================================================================

import express from 'express';
import { getAdRemovalScript } from './advancedAdBlocker.js';

const router = express.Router();

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0'
];

router.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).json({ success: false, error: 'url مطلوب' });
  }

  try {
    const targetUrl = new URL(target);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);

    const response = await fetch(target, {
      headers: {
        'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': targetUrl.origin + '/',
        'Origin': targetUrl.origin,
        'Cache-Control': 'no-cache'
      },
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `فشل الجلب (كود ${response.status})`
      });
    }

    let html = await response.text();

    // ===== تنظيف عنيف للإعلانات =====
    html = html
      // حذف كل السكربتات الإعلانية المعروفة
      .replace(/<script[^>]*>[\s\S]*?(doubleclick|googlesyndication|adservice|taboola|outbrain|juicyads|exoclick|popads|adsterra|propeller|popcash|adcash|mgid|revcontent|prebid|adsbygoogle|pagead)[\s\S]*?<\/script>/gi, '')
      // حذف كل الـ iframes الإعلانية
      .replace(/<iframe[^>]*(doubleclick|googlesyndication|adservice|taboola|outbrain|juicyads|exoclick|popads|adsterra|propeller|banner|popup|ads)[^>]*>[\s\S]*?<\/iframe>/gi, '')
      // حذف عناصر الإعلانات الشائعة
      .replace(/<div[^>]*(id|class)=["'][^"']*(ad-|ads-|banner|popup|sponsor|promo|overlay|advert)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
      // حذف روابط الإعلانات
      .replace(/<a[^>]*(href=["'][^"']*(doubleclick|juicyads|exoclick|popads|adsterra)[^"']*["'])[^>]*>[\s\S]*?<\/a>/gi, '');

    // حقن سكربت الإزالة القوي
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
    res.status(500).json({
      success: false,
      error: err.name === 'AbortError' ? 'انتهت مهلة الاتصال' : 'فشل في جلب المصدر',
      details: err.message
    });
  }
});

export default router;
