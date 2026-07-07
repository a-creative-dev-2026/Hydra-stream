// ================================================================
// 🔍 محرك البحث والترتيب الديناميكي - اختبار فعلي لكل طلب
// ================================================================

import { providers, buildUrl } from './providers.js';

// ============================================================
// 1. اختبار المصدر (محاولة HEAD ثم GET إذا فشل)
// ============================================================
const testSource = async (url) => {
  try {
    // محاولة HEAD أولاً (أسرع)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const isAlive = response.ok || response.status === 403 || response.status === 302;
    return { isAlive, statusCode: response.status, method: 'HEAD' };
    
  } catch (error) {
    // إذا فشل HEAD، نحاول GET (بعض المواقع تمنع HEAD)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      // نأخذ أول 1024 بايت فقط ثم نغلق الاتصال
      const isAlive = response.ok || response.status === 403 || response.status === 302;
      return { isAlive, statusCode: response.status, method: 'GET' };
      
    } catch (e) {
      return { isAlive: false, statusCode: null, error: e.message };
    }
  }
};

// ============================================================
// 2. توليد معرفات بحث متعددة
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
// 3. البحث وترتيب جميع المصادر (ديناميكي - بدون كاش ثابت)
// ============================================================
export const searchSources = async (params) => {
  const { type, id, season, episode } = params;
  const searchIds = generateSearchIds(id);
  
  console.log(`🔍 جاري الاختبار الفعلي لجميع المصادر (23) عن: ${id}`);

  // اختبار جميع المصادر بالتوازي (بدون أي كاش)
  const results = await Promise.all(
    providers.map(async (provider) => {
      // تجربة جميع المعرفات الممكنة
      for (const searchId of searchIds) {
        const testParams = { type, id: searchId, season, episode };
        const url = buildUrl(provider, testParams);
        if (!url) continue;
        
        const status = await testSource(url);
        if (status.isAlive) {
          // إذا وجدنا معرفاً يعمل، نستخدمه ونتوقف
          return {
            provider: provider.id,
            label: provider.label,
            url: url,
            id: searchId,
            type: 'embed',
            isAlive: true,
            statusCode: status.statusCode,
            method: status.method
          };
        }
      }
      
      // إذا لم يعمل أي معرف، نرجع المصدر ميتاً
      const fallbackUrl = buildUrl(provider, { type, id: id, season, episode });
      return {
        provider: provider.id,
        label: provider.label,
        url: fallbackUrl || '',
        id: id,
        type: 'embed',
        isAlive: false,
        statusCode: null,
        method: null
      };
    })
  );

  const validResults = results.filter(r => r !== null && r.url);

  // ============================================================
  // 🔥 الترتيب الديناميكي: فقط يعتمد على isAlive
  // ============================================================
  // نقسم المصادر إلى مجموعتين: تعمل ولا تعمل
  const alive = validResults.filter(r => r.isAlive === true);
  const dead = validResults.filter(r => r.isAlive === false);

  // نرتب المصادر العاملة حسب سرعة الاستجابة (statusCode)
  // 200 أفضل من 302 أفضل من 403
  alive.sort((a, b) => {
    // نفضل 200 على 302 على 403
    const scoreA = a.statusCode === 200 ? 0 : a.statusCode === 302 ? 1 : a.statusCode === 403 ? 2 : 3;
    const scoreB = b.statusCode === 200 ? 0 : b.statusCode === 302 ? 1 : b.statusCode === 403 ? 2 : 3;
    return scoreA - scoreB;
  });

  // نرتب المصادر الميتة أبجدياً (لكي يكون الترتيب ثابتاً)
  dead.sort((a, b) => a.label.localeCompare(b.label));

  // دمج القائمتين (العاملة أولاً، ثم الميتة)
  const sortedResults = [...alive, ...dead];

  console.log(`✅ ${alive.length} مصدراً يعمل من أصل ${validResults.length}`);
  if (alive.length > 0) {
    console.log(`📊 المصادر العاملة: ${alive.map(r => r.provider).join(', ')}`);
  }

  return sortedResults;
};

// ============================================================
// 4. البحث عن أنمي (مع اختبار فعلي)
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

console.log('🔍 محرك البحث والترتيب الديناميكي جاهز (بدون كاش ثابت)'); 
