import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import vuetify from '../../src/plugins/vuetify.js';
import { translations } from '../../src/index.js';
import ExportedComponentsFixture from './ExportedComponentsFixture.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en: translations.en, pt: translations.pt }
});

createApp(ExportedComponentsFixture).use(vuetify).use(i18n).mount('#app');
