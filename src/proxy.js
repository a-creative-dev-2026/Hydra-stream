// ================================================================
// 🛡️ سيرفر وسيط Pro Max - ينظف الإعلانات من جميع المصادر
// ================================================================

import express from 'express';
import { getAdRemovalScript } from './advancedAdBlocker.js';

const router = express.Router();

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
    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': new URL(target).origin
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      return res.status(response.status).send('فشل جلب الصفحة من المصدر');
    }

    let html = await response.text();

    // ===== تنظيف قوي للإعلانات =====
    html = html
      // حذف سكربتات الإعلانات
      .replace(/<script[^>]*(ads|doubleclick|googlesyndication|taboola|outbrain|juicyads|exoclick|popads|adsterra|propeller|popcash|adcash|hilltopads)[^>]*>[\s\S]*?<\/script>/gi, '')
      // حذف iframes إعلانية
      .replace(/<iframe[^>]*(doubleclick|googlesyndication|adservice|taboola|outbrain|juicyads|exoclick|popads|adsterra|propeller|popcash|banner|popup)[^>]*>[\s\S]*?<\/iframe>/gi, '')
      // حذف عناصر div إعلانية
      .replace(/<div[^>]*(id|class)=["'][^"']*(ad-|ads-|banner|popup|sponsor|promo|overlay)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

    // حقن سكربت الإزالة على العميل
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
      error: 'حدث خطأ أثناء معالجة الصفحة',
      details: err.message
    });
  }
});

export default router;
