// ================================================================
// 🛡️ نظام منع الإعلانات - متوافق مع السيرفر الوسيط (Proxy)
// ================================================================

export const AD_DOMAINS = [
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'adservice.google', 'amazon-adsystem.com', 'taboola.com', 'outbrain.com',
  'pubmatic.com', 'openx.net', 'rubiconproject.com', 'adnxs.com',
  'criteo.com', 'teads.tv', 'smartadserver.com', 'juicyads.com',
  'exoclick.com', 'popads.net', 'adsterra.com', 'propellerads.com',
  'clickadu.com', 'mgid.com', 'revcontent.com', 'cpmstar.com',
  'adform.net', 'bidswitch.net', 'casalemedia.com', 'contextweb.com',
  'lijit.com', 'adblade.com', 'adtech.com', 'adverttraffic.com',
  'popcash.net', 'adcash.com', 'hilltopads.com', 'trafficjunky.com',
  'adsbygoogle', 'pagead2', 'prebid'
];

const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0'
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function isAdUrl(url = '') {
  if (!url) return true;
  const lower = url.toLowerCase();
  return AD_DOMAINS.some(d => lower.includes(d)) ||
    /[\/\-\.](ad|ads|banner|popup|sponsor|promo|track|pixel|click)[\/\-\.]/i.test(lower);
}

function cleanUrl(url) {
  try {
    const u = new URL(url);
    [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'ref', 'click_id', 'affiliate', 'partner',
      'campaign', 'source', 'tracking', 'ad', 'banner', 'popup'
    ].forEach(p => u.searchParams.delete(p));
    return u.toString();
  } catch {
    return url;
  }
}

async function fetchHtml(url, timeout = 12000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractDirectVideo(html) {
  const patterns = [
    /["'](https?:[^"']+\.m3u8[^"']*)["']/gi,
    /["'](https?:[^"']+\.mp4[^"']*)["']/gi,
    /(?:file|src|source|url|playlist|manifest)\s*[:=]\s*["'](https?:[^"']+\.(?:m3u8|mp4)[^"']*)["']/gi
  ];

  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)];
    for (const match of matches) {
      const url = match[1];
      if (url && url.startsWith('http') && !isAdUrl(url)) {
        return cleanUrl(url);
      }
    }
  }
  return null;
}

export function getAdRemovalScript() {
  const domainsJson = JSON.stringify(AD_DOMAINS);
  return `
(function() {
  var AD_DOMAINS = ${domainsJson};
  var bad = /ad|ads|banner|popup|sponsor|promo|overlay|preroll|midroll|advert|doubleclick|taboola|outbrain|juicy|exoclick|popads|adsterra|propeller|popcash|adsbygoogle|pagead/i;

  function urlIsAd(url) {
    if (!url) return false;
    var lower = String(url).toLowerCase();
    return AD_DOMAINS.some(function(d) { return lower.indexOf(d) !== -1; });
  }

  try {
    var style = document.createElement('style');
    style.textContent =
      '[class*="popup"],[class*="overlay"],[class*="banner"],[id*="banner"],' +
      '[class*="sponsor"],[id*="sponsor"],ins.adsbygoogle,[class*="ad-container"],' +
      '[id*="ad-container"],iframe[src*="doubleclick"],iframe[src*="googlesyndication"]' +
      '{ display:none !important; visibility:hidden !important; pointer-events:none !important; }';
    (document.head || document.documentElement).appendChild(style);
  } catch (e) {}

  function isBad(el) {
    if (!el || el.nodeType !== 1) return false;
    var id = (el.id || '').toLowerCase();
    var cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
    var src = (el.src || el.href || '').toLowerCase();
    return bad.test(id + ' ' + cls + ' ' + src);
  }

  function isOverlayLike(el) {
    if (!el || el.nodeType !== 1 || el === document.body || el === document.documentElement) return false;
    try {
      var s = window.getComputedStyle(el);
      var pos = s.position;
      if (pos !== 'fixed' && pos !== 'absolute') return false;
      var z = parseInt(s.zIndex) || 0;
      var rect = el.getBoundingClientRect();
      var coversViewport = rect.width >= window.innerWidth * 0.6 && rect.height >= window.innerHeight * 0.6;
      var isInvisible = s.opacity === '0' || s.visibility === 'hidden';
      return coversViewport && (z >= 999 || isInvisible || z > 10);
    } catch (e) {
      return false;
    }
  }

  function clean() {
    try {
      document.querySelectorAll('div, iframe, ins, section, aside, span, a').forEach(function(el) {
        if (isBad(el)) { try { el.remove(); } catch(e) {} }
      });
      document.querySelectorAll('div, iframe, section, aside, ins, a').forEach(function(el) {
        if (isOverlayLike(el)) { try { el.remove(); } catch(e) {} }
      });
      document.querySelectorAll('meta[http-equiv="refresh" i]').forEach(function(el) {
        try { el.remove(); } catch(e) {}
      });
    } catch(e) {}
  }

  clean();
  var fastTicks = 0;
  var fastTimer = setInterval(function() {
    clean();
    fastTicks++;
    if (fastTicks > 25) clearInterval(fastTimer);
  }, 200);
  setInterval(clean, 700);

  if (document.body) {
    new MutationObserver(function(mutations) {
      clean();
      mutations.forEach(function(m) {
        m.addedNodes && m.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.tagName === 'SCRIPT' && node.src && bad.test(node.src)) {
            try { node.remove(); } catch(e) {}
          }
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  window.open = function() { return null; };

  var originalWrite = document.write;
  document.write = function(html) {
    if (typeof html === 'string' && bad.test(html)) return;
    return originalWrite.apply(document, arguments);
  };
  document.writeln = document.write;

  if (window.navigator && navigator.serviceWorker && navigator.serviceWorker.register) {
    navigator.serviceWorker.register = function() {
      return Promise.reject(new Error('Service Worker registration blocked'));
    };
  }

  if (window.Notification) {
    try {
      Object.defineProperty(Notification, 'permission', { value: 'denied', configurable: false });
      Notification.requestPermission = function(cb) {
        if (typeof cb === 'function') cb('denied');
        return Promise.resolve('denied');
      };
    } catch (e) {}
  }

  var originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = function(input, init) {
      var url = typeof input === 'string' ? input : (input && input.url);
      if (urlIsAd(url)) {
        return Promise.reject(new Error('Blocked ad request'));
      }
      return originalFetch.apply(window, arguments);
    };
  }

  var OriginalXHR = window.XMLHttpRequest;
  if (OriginalXHR) {
    var originalOpen = OriginalXHR.prototype.open;
    OriginalXHR.prototype.open = function(method, url) {
      if (urlIsAd(url)) {
        this.__blocked = true;
        return;
      }
      return originalOpen.apply(this, arguments);
    };
    var originalSend = OriginalXHR.prototype.send;
    OriginalXHR.prototype.send = function() {
      if (this.__blocked) return;
      return originalSend.apply(this, arguments);
    };
  }

  function guard(e) {
    var el = e.target;
    var depth = 0;
    while (el && depth < 6) {
      if (isBad(el) || isOverlayLike(el)) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        return;
      }
      el = el.parentElement;
      depth++;
    }
  }

  ['click', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'contextmenu'].forEach(function(evt) {
    document.addEventListener(evt, guard, { capture: true, passive: false });
  });

  document.addEventListener('click', function(e) {
    var a = e.target.closest && e.target.closest('a');
    if (a && a.href && bad.test(a.href)) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (a && a.target === '_blank' && !a.href.match(/^https?:\\/\\/(www\\.)?(youtube|google)\\.com/i)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();
`;
}

export async function getAdFreeVideo(embedUrl, providerId = 'unknown') {
  if (!embedUrl || embedUrl === '#') return embedUrl;

  const cacheKey = providerId + ':' + embedUrl;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.url;
  }

  try {
    const html = await fetchHtml(embedUrl);
    if (html) {
      const direct = extractDirectVideo(html);
      if (direct) {
        cache.set(cacheKey, { url: direct, time: Date.now() });
        return direct;
      }
    }

    const cleaned = cleanUrl(embedUrl);
    cache.set(cacheKey, { url: cleaned, time: Date.now() });
    return cleaned;

  } catch (err) {
    cache.set(cacheKey, { url: embedUrl, time: Date.now() });
    return embedUrl;
  }
}

export function filterM3U8Ads(playlistText, baseUrl) {
  if (!playlistText) return playlistText;

  const lines = playlistText.split('\n');
  const output = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (
      line.startsWith('#EXT-X-CUE-OUT') ||
      line.startsWith('#EXT-X-CUE-IN') ||
      line.startsWith('#EXT-X-SCTE35') ||
      (line.startsWith('#EXT-X-DATERANGE') && /ad|advert|creative|splice/i.test(line))
    ) {
      continue;
    }

    if (line && !line.startsWith('#')) {
      let absolute = line;
      try {
        absolute = new URL(line, baseUrl).toString();
      } catch {}

      if (isAdUrl(absolute)) {
        if (output.length && output[output.length - 1].startsWith('#EXTINF')) {
          output.pop();
        }
        continue;
      }

      output.push(absolute);
      continue;
    }

    output.push(raw);
  }

  return output.join('\n');
}

export function buildProxyUrl(targetUrl) {
  if (!targetUrl || targetUrl === '#') return targetUrl;
  return `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
}

export function sanitizeHtml(html) {
  if (!html) return html;

  let cleaned = html;

  cleaned = cleaned.replace(/<meta[^>]+http-equiv=["']?refresh["']?[^>]*>/gi, '');

  const adScriptPattern = new RegExp(
    '<script[^>]+src=["\']?[^"\'>]*(' +
      AD_DOMAINS.map(d => d.replace(/\./g, '\\.')).join('|') +
      ')[^"\'>]*["\']?[^>]*><\\/script>',
    'gi'
  );
  cleaned = cleaned.replace(adScriptPattern, '');

  return cleaned;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache) {
    if (now - value.time > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 60 * 60 * 1000);

export default {
  getAdFreeVideo,
  getAdRemovalScript,
  filterM3U8Ads,
  buildProxyUrl,
  sanitizeHtml,
  cleanUrl,
  isAdUrl,
  AD_DOMAINS
};
