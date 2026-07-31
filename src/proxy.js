import express from 'express';
import { createEmbedGuardHandler } from 'aetherly-embed-guard';

const router = express.Router();

const guard = createEmbedGuardHandler({
  proxyPath: '/api/proxy',
  requestTimeoutMs: 15000,
  retries: 1
});

router.get('/proxy', async (req, res) => {
  try {
    const fullUrl = `https://\( {req.headers.host} \){req.originalUrl}`;
    const request = new Request(fullUrl, {
      method: 'GET',
      headers: {
        'user-agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'accept': req.headers['accept'] || '*/*'
      }
    });

    const response = await guard.GET(request);
    const body = await response.text();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (!['content-encoding', 'transfer-encoding', 'content-length'].includes(k)) {
        res.setHeader(key, value);
      }
    });
    res.send(body);
  } catch (err) {
    console.error('Proxy Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
