// ================================================================
// 🔍 محرك البحث المتوازي - اختبار جميع المصادر مع ترتيبها
// ================================================================

import { providers, buildUrl } from './providers.js';

// ============================================================
// 1. اختبار المصدر بسرعة (مهلة 800ms)
// ============================================================
const testSource = async (url) => {
  if (!url) return { isAlive: false, statusCode: null };
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);
    
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return { 
      isAlive: response.ok || response.status === 403 || response.status === 302,
      statusCode: response.status 
    };
  } catch {
    return { isAlive: false, statusCode: null };
  }
};

// ============================================================
// 2. اختبار جميع المصادر بالتوازي (Promise.all)
// ============================================================
export const searchSources = async (params) => {
  const { type, id, season, episode } = params;
  
  console.log(`⚡ جاري اختبار جميع المصادر (10) بالتوازي عن: ${id}`);

  // 1. اختبار جميع المصادر بالتوازي
  const results = await Promise.all(
    providers.map(async (provider) => {
      // بناء الرابط
      let url = buildUrl(provider, { type, id, season, episode });
      
      // إذا فشل، نحاول تحويل المعرف
      if (!url && id.startsWith('tt')) {
        const numId = parseInt(id.replace('tt', ''));
        if (!isNaN(numId)) {
          url = buildUrl(provider, { type, id: numId, season, episode });
        }
      }
      
      // اختبار المصدر
      const status = await testSource(url);
      
      return {
        provider: provider.id,
        label: provider.label,
        url: url || '#',
        id: id,
        isAlive: status.isAlive,
        statusCode: status.statusCode,
        hasValidUrl: !!url
      };
    })
  );

  // 2. ترتيب النتائج: المصادر العاملة أولاً
  const sortedResults = results.sort((a, b) => {
    // المصادر التي تعمل أولاً
    if (a.isAlive && !b.isAlive) return -1;
    if (!a.isAlive && b.isAlive) return 1;
    
    // ثم حسب الأولوية (ترتيب المصادر في القائمة)
    const aIndex = providers.findIndex(p => p.id === a.provider);
    const bIndex = providers.findIndex(p => p.id === b.provider);
    return aIndex - bIndex;
  });

  const aliveCount = sortedResults.filter(r => r.isAlive).length;
  console.log(`✅ ${aliveCount} مصدراً يعمل من أصل ${results.length}`);
  console.log(`📊 المصادر العاملة: ${sortedResults.filter(r => r.isAlive).map(r => r.provider).join(', ')}`);

  return sortedResults;
};

// ============================================================
// 3. البحث عن أنمي (يُضاف إلى القائمة)
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
    
    const status = await testSource(url);
    if (status.isAlive) {
      return {
        provider: 'animeplay',
        label: 'AnimePlay.cfd',
        url: url,
        id: id,
        type: 'anime',
        language: language,
        isAlive: true,
        statusCode: status.statusCode
      };
    }
  } catch (e) {}
  return null;
};

console.log('⚡ محرك البحث المتوازي جاهز (جميع المصادر)');
