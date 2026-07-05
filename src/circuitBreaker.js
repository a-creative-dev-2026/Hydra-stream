// إدارة حالة المصادر بدون اتصال خارجي
const breakerState = new Map();

export const circuitBreaker = {
  // التحقق من حالة المصدر
  isOpen(providerId) {
    const state = breakerState.get(providerId);
    if (!state) return false;
    
    if (state.status === 'OPEN') {
      // التحقق من انتهاء وقت الحظر
      if (Date.now() > state.nextAttempt) {
        state.status = 'HALF_OPEN';
        state.failures = 0;
        return false;
      }
      return true;
    }
    return false;
  },
  
  // تسجيل نجاح (محاكاة)
  recordSuccess(providerId) {
    const state = breakerState.get(providerId);
    if (state) {
      state.failures = 0;
      state.status = 'CLOSED';
    }
  },
  
  // تسجيل فشل (محاكاة)
  recordFailure(providerId) {
    const state = breakerState.get(providerId);
    if (!state) {
      breakerState.set(providerId, {
        failures: 1,
        status: 'CLOSED',
        nextAttempt: Date.now()
      });
      return;
    }
    
    state.failures += 1;
    
    if (state.failures >= 5) {
      state.status = 'OPEN';
      state.nextAttempt = Date.now() + 15 * 60 * 1000;
      console.log(`⛔ المصدر ${providerId} معطل مؤقتاً (15 دقيقة)`);
    }
  },
  
  // إحصائيات
  getStats() {
    return Object.fromEntries(breakerState);
  },

  // إعادة تعيين
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
