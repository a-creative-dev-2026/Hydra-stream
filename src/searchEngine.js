// ================================================================
// 🔍 محرك البحث والترتيب - جميع المصادر (23)
// ================================================================

import { providers, buildUrl } from './providers.js';

// ============================================================
// 1. ذاكرة تخزين حالة المصادر (تجنب إعادة الاختبار)
// ============================================================
const sourceStatusCache = new Map();
const STATUS_CACHE_TTL = 5 * 60 * 1000; // 5 دقائق

// ============================================================
// 2. ترتيب الأولوية (من الأفضل إلى الأضعف)
// ============================================================
const PRIORITY_ORDER = [
  'vidsrc.pm', 'moviesapi', 'vidcore', 'vidsrc.to', 'vidsrc.me',
  'vidsrc.mov', 'videasy', 'vidsrc.wiki', 'vidsrc.sbs', 'streamvaultsrc',
  'vidsrc.top', 'vidsrc.ru', 'vidfast.vc', 'cinemaos', '111movies',
  'vidzee', 'vidnest', 'cinesrc', 'wavembed', 'apiplayer',
  'vidzen', 'vidphantom', 'animeplay'
];

const getPriority = (id) => {
  const index = PRIORITY_ORDER.indexOf(id);
  return index === -1 ? 999 : index;
};

// ============================================================
// 3. اختبار المصدر (مهلة 1.5 ثانية)
// ============================================================
const testSource = async (url, providerId) => {
  // التحقق من الكاش
  const cached = sourceStatusCache.get(providerId);
  if (cached && (Date.now() - cached.timestamp < STATUS_CACHE_TTL)) {
    return cached;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const isAlive = response.ok || response.status === 403 || response.status === 302;
    
    const result = { isAlive, statusCode: response.status, timestamp: Date.now() };
    sourceStatusCache.set(providerId, result);
    return result;
  } catch (error) {
    const result = { isAlive: false, statusCode: null, error: error.message, timestamp: Date.now() };
    sourceStatusCache.set(providerId, result);
    return result;
  }
};

// ============================================================
// 4. توليد معرفات بحث متعددة
// ============================================================
const generateSearchIds = (id) => {
  const ids = [id];
  if (id.startsWith('tt')) {
    const num = id.replace('tt', '');
    if (!isNaN(num)) ids.push(parseInt(num));
  }
  return ids;
};

// ============================================================
// 5. البحث وترتيب جميع المصادر
// ============================================================
export const searchSources = async (params) => {
  const { type, id, season, episode } = params;
  const searchIds = generateSearchIds(id);
  
  console.log(`🔍 جاري اختبار وترتيب جميع المصادر (23) عن: ${id}`);

  // اختبار جميع المصادر بالتوازي
  const results = await Promise.all(
    providers.map(async (provider) => {
      const searchId = searchIds[0] || id;
      const testParams = { type, id: searchId, season, episode };
      const url = buildUrl(provider, testParams);
      if (!url) return null;
      
      const status = await testSource(url, provider.id);
      return {
        provider: provider.id,
        label: provider.label,
        url: url,
        id: searchId,
        type: 'embed',
        isAlive: status.isAlive,
        statusCode: status.statusCode,
        error: status.error || null,
        priority: getPriority(provider.id)
      };
    })
  );

  const validResults = results.filter(r => r !== null);

  // ترتيب: الحي أولاً، ثم حسب الأولوية
  validResults.sort((a, b) => {
    if (a.isAlive && !b.isAlive) return -1;
    if (!a.isAlive && b.isAlive) return 1;
    return a.priority - b.priority;
  });

  const aliveCount = validResults.filter(r => r.isAlive).length;
  console.log(`✅ ${aliveCount} مصدراً يعمل من أصل ${validResults.length}`);
  
  return validResults;
};

// ============================================================
// 6. البحث عن أنمي
// ============================================================
export const searchAnime = async (params) => {
  const { id, season, episode, language = 'sub', source = 's-2' } = params;
  
  try {
    const animeProvider = providers.find(p => p.id === 'animeplay');
    if (!animeProvider) return null;
    
    const url = animeProvider.buildUrl({
      type: 'tv',
      id: id,
      season: season,
      episode: episode,
      animeSource: source,
      language: language
    });
    
    if (!url) return null;
    
    const status = await testSource(url, 'animeplay');
    if (status.isAlive) {
      return {
        provider: 'animeplay',
        label: 'AnimePlay.cfd',
        url: url,
        id: id,
        type: 'anime',
        language: language,
        isAlive: true,
        statusCode: status.statusCode,
        priority: getPriority('animeplay')
      };
    }
  } catch (e) {}
  return null;
};

// تنظيف الكاش
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of sourceStatusCache) {
    if (now - value.timestamp > STATUS_CACHE_TTL) {
      sourceStatusCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

console.log('🔍 محرك البحث والترتيب جاهز (23 مصدراً)');
