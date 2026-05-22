import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '@/locales/en/common.json';
import viCommon from '@/locales/vi/common.json';

const resources = {
  en: { common: enCommon },
  vi: { common: viCommon },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: false,
    },
  });
} else {
  // Hot-reload safe: always sync the latest JSON into the existing instance
  i18n.addResourceBundle('en', 'common', enCommon, true, true);
  i18n.addResourceBundle('vi', 'common', viCommon, true, true);
}

export default i18n;
