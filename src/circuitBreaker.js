// حالة كل مصدر
const breakerState = new Map();

export const circuitBreaker = {
  // التحقق من حالة المصدر
  isOpen(providerId) {
    const state = breakerState.get(providerId);
    if (!state) return false;
    
    // إذا كان مفتوحاً، تحقق من انتهاء وقت الحظر
    if (state.status === 'OPEN') {
      if (Date.now() > state.nextAttempt) {
        // انتقل إلى حالة HALF-OPEN لاختبار المصدر
        state.status = 'HALF_OPEN';
        state.failures = 0;
        return false;
      }
      return true; // لا نستخدم هذا المصدر حالياً
    }
    return false;
  },
  
  // تسجيل نجاح المصدر
  recordSuccess(providerId) {
    const state = breakerState.get(providerId);
    if (state) {
      state.failures = 0;
      state.status = 'CLOSED';
    }
  },
  
  // تسجيل فشل المصدر
  recordFailure(providerId) {
    const state = breakerState.get(providerId);
    if (!state) {
      // إنشاء حالة جديدة للمصدر
      breakerState.set(providerId, {
        failures: 1,
        status: 'CLOSED',
        nextAttempt: Date.now()
      });
      return;
    }
    
    state.failures += 1;
    
    // إذا فشل 5 مرات متتالية، افتح الدائرة
    if (state.failures >= 5) {
      state.status = 'OPEN';
      state.nextAttempt = Date.now() + 15 * 60 * 1000; // 15 دقيقة
      console.log(`⛔ Circuit Breaker فتح للمصدر: ${providerId} لمدة 15 دقيقة`);
    }
  },
  
  // الحصول على إحصائيات المصادر
  getStats() {
    return Object.fromEntries(breakerState);
  },

  // إعادة تعيين جميع قواطع الدائرة
  resetAll() {
    for (const [key] of breakerState) {
      breakerState.set(key, {
        failures: 0,
        status: 'CLOSED',
        nextAttempt: Date.now()
      });
    }
    console.log('🔄 تم إعادة تعيين جميع قواطع الدائرة');
  }
};
