// ================================================================
// 📦 المحتوى المفقود (أفلام، مسلسلات، أنمي، كرتون)
// ================================================================

export const missingContent = [
  // ============================================================
  // 📺 مسلسل سالي (مدبلج) - 27 حلقة
  // ============================================================
  {
    id: 'sally-dubbed',
    label: 'سالي مدبلج',
    type: 'tv',
    dubbed: true,
    episodes: [
      { number: 1, iframeUrl: 'https://pixeldrain.com/api/file/1BtKj7an' },
      { number: 2, iframeUrl: 'https://pixeldrain.com/api/file/kGXozf2Y' },
      { number: 3, iframeUrl: 'https://pixeldrain.com/api/file/qMY4De4k' },
      { number: 4, iframeUrl: 'https://pixeldrain.com/api/file/wfUs2Edg' },
      { number: 5, iframeUrl: 'https://pixeldrain.com/api/file/adqiqJfX' },
      { number: 6, iframeUrl: 'https://pixeldrain.com/api/file/nm6qc1de' },
      { number: 7, iframeUrl: 'https://pixeldrain.com/api/file/UJvqMGRB' },
      { number: 8, iframeUrl: 'https://pixeldrain.com/api/file/daXZNoTc' },
      { number: 9, iframeUrl: 'https://pixeldrain.com/api/file/ZwHrr1VT' },
      { number: 10, iframeUrl: 'https://pixeldrain.com/api/file/2BZj4cus' },
      { number: 11, iframeUrl: 'https://pixeldrain.com/api/file/7n7b9wvz' },
      { number: 12, iframeUrl: 'https://pixeldrain.com/api/file/QX544KrH' },
      { number: 13, iframeUrl: 'https://pixeldrain.com/api/file/j28SsECS' },
      { number: 14, iframeUrl: 'https://pixeldrain.com/api/file/kqukx44v' },
      { number: 15, iframeUrl: 'https://pixeldrain.com/api/file/813DdoDx' },
      { number: 16, iframeUrl: 'https://pixeldrain.com/api/file/FV4qE4oC' },
      { number: 17, iframeUrl: 'https://pixeldrain.com/api/file/mfNoAUxV' },
      { number: 18, iframeUrl: 'https://pixeldrain.com/api/file/BrZmAmrL' },
      { number: 19, iframeUrl: 'https://pixeldrain.com/api/file/Uhp927Fd' },
      { number: 20, iframeUrl: 'https://pixeldrain.com/api/file/9xYzveAW' },
      { number: 21, iframeUrl: 'https://pixeldrain.com/api/file/39gHxThk' },
      { number: 22, iframeUrl: 'https://pixeldrain.com/api/file/YJQ17Zrk' },
      { number: 23, iframeUrl: 'https://pixeldrain.com/api/file/m1qFHU19' },
      { number: 24, iframeUrl: 'https://pixeldrain.com/api/file/uyuMGX3s' },
      { number: 25, iframeUrl: 'https://pixeldrain.com/api/file/qnLGkfg9' },
      { number: 26, iframeUrl: 'https://pixeldrain.com/api/file/R6NCZgTP' },
      { number: 27, iframeUrl: 'https://pixeldrain.com/api/file/CCBZUyC2' }
    ]
  }
];

// ============================================================
// 🔍 دالة البحث عن المحتوى المفقود
// ============================================================
export const findMissingContent = (type, id) => {
  if (id && id.startsWith('missing-')) {
    return missingContent.find(item => item.id === id);
  }
  return null;
};

// ============================================================
// 📋 دالة جلب المحتوى المفقود حسب النوع
// ============================================================
export const getMissingContentByType = (type) => {
  return missingContent.filter(item => item.type === type);
};
