import { circuitBreaker } from './circuitBreaker.js';

// محاكاة طلب المصادر (بدون اتصال خارجي حقيقي)
const simulateFetch = (url, providerId) => {
  return new Promise((resolve) => {
    // محاكاة نجاح عشوائي (لتجربة الميزة)
    const isSuccess = Math.random() > 0.3; // 70% نجاح
    
    setTimeout(() => {
      if (isSuccess) {
        circuitBreaker.recordSuccess(providerId);
        resolve({ providerId, url, status: 'success' });
      } else {
        circuitBreaker.recordFailure(providerId);
        throw new Error('محاكاة فشل المصدر');
      }
    }, 200);
  });
};

export const fetchSourcesParallel = async (sources) => {
  const availableSources = sources.filter(s => !circuitBreaker.isOpen(s.id));
  
  if (availableSources.length === 0) {
    throw new Error('جميع المصادر معطلة حالياً');
  }
  
  const fetchPromises = availableSources.map(source => 
    simulateFetch(source.url, source.id)
  );
  
  try {
    const result = await Promise.any(fetchPromises);
    console.log(`✅ تم اختيار المصدر: ${result.providerId}`);
    return result;
  } catch (error) {
    throw new Error('جميع المصادر غير متاحة');
  }
};
