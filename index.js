import { refreshSources } from './src/autoUpdater.js';

// عند بدء السيرفر، ابحث عن المصادر الحية فوراً
refreshSources().then(() => {
  console.log('✅ تم تهيئة المصادر الحية بنجاح');
});

// ... باقي كود السيرفر
