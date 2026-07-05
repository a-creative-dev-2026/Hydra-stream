import { providers, buildUrl } from './providers.js';
import { fetchSourcesParallel } from './fetchWithTimeout.js';
import { circuitBreaker } from './circuitBreaker.js';

// تخزين مؤقت بسيط
const memoryCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // ساعة واحدة

export const getStreams = async (params) => {
  const cacheKey = `${params.type}:${params.id}:${params.season}:${params.episode}`;
  
  // التحقق من الكاش
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`✅ من الكاش: ${cacheKey}`);
      return entry.sources;
    }
  }
  
  // بناء قائمة المصادر (مع تجاوز المفتوحة)
  const allSources = providers
    .filter(provider => !circuitBreaker.isOpen(provider.id))
    .map(provider => ({
      id: provider.id,
      label: provider.label,
      url: buildUrl(provider, params)
    }));
  
  if (allSources.length === 0) {
    // جميع المصادر معطلة، نعيد قائمة احتياطية
    const fallback = providers.map(p => ({
      id: p.id,
      label: p.label,
      url: buildUrl(p, params),
      status: '⏳ حاول مرة أخرى خلال 15 دقيقة'
    }));
    return fallback;
  }
  
  try {
    // جلب المصادر بالتوازي
    const result = await fetchSourcesParallel(allSources);
    
    const sources = [{
      id: result.providerId,
      label: providers.find(p => p.id === result.providerId)?.label || result.providerId,
      url: result.url,
      status: 'ready'
    }];
    
    // تخزين في الكاش
    memoryCache.set(cacheKey, {
      timestamp: Date.now(),
      sources
    });
    
    return sources;
  } catch (error) {
    console.error('❌ فشل جلب المصادر:', error.message);
    
    // في حالة الفشل، نعيد قائمة احتياطية
    const fallback = allSources.map(s => ({
      ...s,
      status: '⚠️ حاول مرة أخرى'
    }));
    return fallback;
  }
};
