import express from 'express';
import { getAdRemovalScript } from './advancedAdBlocker.js';

const router = express.Router();

router.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).json({ error: 'url مطلوب' });
  }

  try {
    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send('فشل جلب الصفحة');
    }

    let html = await response.text();

    // تنظيف الإعلانات من HTML
    html = html
      .replace(/<script[^>]*(ads|doubleclick|googlesyndication|taboola|outbrain|juicyads|exoclick|popads)[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*(doubleclick|googlesyndication|adservice|taboola|outbrain|juicyads|exoclick|popads)[^>]*>[\s\S]*?<\/iframe>/gi, '');

    // حقن سكربت الإزالة
    const script = `<script>${getAdRemovalScript()}</script>`;
    if (html.includes('</body>')) {
      html = html.replace('</body>', script + '</body>');
    } else {
      html += script;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(html);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
