// ================================================================
// 🔍 محرك البحث التلقائي عن المصادر - الإصدار المتقدم
// ================================================================

import { providers, buildUrl } from './providers.js';

// ============================================================
// 1. قاعدة بيانات المعرفات (للبحث التلقائي)
// ============================================================
const ID_DATABASE = {
  // يمكن توسيعها حسب الحاجة
  'tt1375666': { tmdb: 27205, imdb: 'tt1375666' },
  'tt0944947': { tmdb: 1399, imdb: 'tt0944947' },
  'tt0903747': { tmdb: 1100, imdb: 'tt0903747' },
  'tt0133093': { tmdb: 603, imdb: 'tt0133093' },
  'tt0468569': { tmdb: 155, imdb: 'tt0468569' }
};

// ============================================================
// 2. البحث في مصادر متعددة (ذكي)
// ============================================================
export const searchSources = async (params) => {
  const { type, id, season, episode } = params;
  const results = [];
  const searchIds = generateSearchIds(id);
  
  console.log(`🔍 بدء البحث التلقائي عن: ${id} (${type})`);

  for (const provider of providers) {
    // تجاهل مصادر الأنمي للبحث العادي (تستخدم لاحقاً)
    if (provider.id === 'animeplay') continue;
    
    // تجربة كل معرف محتمل
    for (const searchId of searchIds) {
      try {
        const testParams = { 
          type, 
          id: searchId, 
          season, 
          episode 
        };
        
        const url = buildUrl(provider, testParams);
        if (!url) continue;
        
        // اختبار سريع للرابط
        const isValid = await testSource(url);
        if (isValid) {
          results.push({
            provider: provider.id,
            label: provider.label,
            url: url,
            id: searchId,
            type: 'embed',
            quality: 'auto'
          });
          break; // نوقف التجربة لهذا المصدر عند أول نجاح
        }
      } catch (e) {
        // تجاهل الأخطاء
      }
    }
  }

  // ترتيب النتائج حسب الجودة (المصادر الموثوقة أولاً)
  const priorityOrder = ['vidsrc.pm', 'moviesapi', 'vidcore', 'vidsrc.to', 'vidsrc.me'];
  results.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.provider);
    const bIndex = priorityOrder.indexOf(b.provider);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  console.log(`✅ تم العثور على ${results.length} مصدراً`);
  return results;
};

// ============================================================
// 3. توليد معرفات بحث متعددة (ذكي)
// ============================================================
const generateSearchIds = (id) => {
  const ids = [id];
  
  // إذا كان المعرف من نوع IMDb
  if (id.startsWith('tt')) {
    // محاولة تحويل إلى TMDB ID
    if (ID_DATABASE[id]) {
      ids.push(ID_DATABASE[id].tmdb);
    }
    // محاولة استخراج الرقم
    const num = id.replace('tt', '');
    if (!isNaN(num)) {
      ids.push(parseInt(num));
    }
  } else if (!isNaN(id)) {
    // إذا كان رقمياً، حاول تحويله إلى IMDb (إذا كان في قاعدة البيانات)
    const numId = parseInt(id);
    for (const [key, value] of Object.entries(ID_DATABASE)) {
      if (value.tmdb === numId) {
        ids.push(key);
        break;
      }
    }
  }
  
  // إزالة التكرارات
  return [...new Set(ids)];
};

// ============================================================
// 4. اختبار المصدر بسرعة
// ============================================================
const testSource = async (url) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok || response.status === 403 || response.status === 302;
  } catch {
    return false;
  }
};

// ============================================================
// 5. البحث عن أنمي (مخصص)
// ============================================================
export const searchAnime = async (params) => {
  const { id, season, episode, language = 'sub', source = 's-2' } = params;
  
  console.log(`🔍 بحث عن أنمي: ${id} (الموسم ${season}، الحلقة ${episode})`);
  
  try {
    // نبحث عن المصدر المناسب للأنمي
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
    
    const isValid = await testSource(url);
    if (isValid) {
      return {
        provider: 'animeplay',
        label: 'AnimePlay.cfd',
        url: url,
        id: id,
        type: 'anime',
        quality: 'auto',
        language: language
      };
    }
  } catch (e) {
    console.warn(`⚠️ فشل البحث عن أنمي: ${e.message}`);
  }
  
  return null;
};
