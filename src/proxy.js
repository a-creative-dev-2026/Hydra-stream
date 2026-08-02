// ================================================================
// 🛡️ البروكسي الفعلي - يمرر المحتوى عبر سيرفرنا ويطبق الحجب
// ================================================================

import express from 'express';
import { isAdUrl, getAdRemovalScript, filterM3U8Ads } from './advancedAdBlocker.js';

const router = express.Router();

const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const REQUEST_TIMEOUT_MS = 15000;

function injectAdRemovalScript(html) {
  const tag = `<script>${getAdRemovalScript()}</script>`;
  if (html.includes('</head>')) return html.replace('</head>', `${tag}</head>`);
  if (html.includes('</body>')) return html.replace('</body>', `${tag}</body>`);
  return html + tag;
}

function isM3U8(url, contentType) {
  return (
    url.toLowerCase().includes('.m3u8') ||
    contentType.includes('mpegurl') ||
    contentType.includes('m3u8')
  );
}

router.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ success: false, error: 'باراميتر url مطلوب. مثال: /api/proxy?url=https://example.com' });
  }

  if (isAdUrl(targetUrl)) {
    return res.status(403).json({ success: false, error: 'تم حظر هذا الرابط (مصنّف كإعلان)' });
  }

  let upstreamUrl;
  try {
    upstreamUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({ success: false, error: 'رابط غير صالح' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl.toString(), {
      headers: {
        'User-Agent': req.headers['user-agent'] || DEFAULT_UA,
        'Accept': req.headers['accept'] || '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': upstreamUrl.origin
      },
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timer);

    const contentType = (upstream.headers.get('content-type') || '').toLowerCase();

    if (isM3U8(upstreamUrl.toString(), contentType)) {
      const text = await upstream.text();
      const filtered = filterM3U8Ads(text, upstreamUrl.toString());
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).send(filtered);
    }

    if (contentType.includes('text/html')) {
      const html = await upstream.text();
      const injected = injectAdRemovalScript(html);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).send(injected);
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.send(buffer);
  } catch (err) {
    clearTimeout(timer);
    console.error('Proxy Error:', err.message);
    return res.status(502).json({ success: false, error: 'تعذر الوصول للمصدر: ' + err.message });
  }
});

export default router;
