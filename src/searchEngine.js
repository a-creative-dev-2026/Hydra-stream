// ================================================================
// 🔍 محرك البحث الديناميكي - اختبار وترتيب كل طلب على حدة
// ================================================================

import { providers, buildUrl } from './providers.js';

// ============================================================
// 1. اختبار المصدر (مهلة 800ms)
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
// 2. ترتيب المصادر (ديناميكي حسب الأولوية)
// ============================================================
const PRIORITY_ORDER = [
  'vidsrc.to', 'vidsrc.pm', 'vidsrc.me', 'vidcore', 'vidsrc.top',
  'moviesapi', '111movies', 'vidspark', 'vidlink', 'vsembed'
];

const getPriority = (id) => {
  const index = PRIORITY_ORDER.indexOf(id);
  return index === -1 ? 999 : index;
};

// ============================================================
// 3. اختبار جميع المصادر بالتوازي وترتيبها ديناميكياً
// ============================================================
export const searchSources = async (params) => {
  const { type, id, season, episode } = params;
  
  console.log(`⚡ اختبار ديناميكي لجميع المصادر (10) عن: ${id}`);

  // 1. اختبار جميع المصادر بالتوازي (بدون أي كاش)
  const results = await Promise.all(
    providers.map(async (provider) => {
      let url = buildUrl(provider, { type, id, season, episode });
      
      if (!url && id.startsWith('tt')) {
        const numId = parseInt(id.replace('tt', ''));
        if (!isNaN(numId)) {
          url = buildUrl(provider, { type, id: numId, season, episode });
        }
      }
      
      const status = await testSource(url);
      
      return {
        provider: provider.id,
        label: provider.label,
        url: url || '#',
        id: id,
        isAlive: status.isAlive,
        statusCode: status.statusCode,
        priority: getPriority(provider.id)
      };
    })
  );

  // 2. ترتيب ديناميكي: يعتمد على الاختبار الفعلي أولاً
  const sortedResults = results.sort((a, b) => {
    // المصادر التي تعمل أولاً (isAlive)
    if (a.isAlive && !b.isAlive) return -1;
    if (!a.isAlive && b.isAlive) return 1;
    
    // إذا كان كلاهما يعملان أو كلاهما لا يعملان، نرتب حسب الأولوية
    return a.priority - b.priority;
  });

  const aliveCount = sortedResults.filter(r => r.isAlive).length;
  console.log(`✅ ${aliveCount} مصدراً يعمل من أصل ${results.length}`);
  console.log(`📊 الترتيب الديناميكي: ${sortedResults.map(r => `${r.provider}(${r.isAlive ? '✅' : '❌'})`).join(' → ')}`);

  return sortedResults;
};

// ============================================================
// 4. البحث عن أنمي (يُضاف إلى القائمة)
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
        statusCode: status.statusCode,
        priority: getPriority('animeplay')
      };
    }
  } catch (e) {}
  return null;
};

console.log('⚡ محرك البحث الديناميكي جاهز (ترتيب متغير لكل طلب)');
