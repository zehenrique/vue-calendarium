import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { translations } from 'vue-calendarium';
import App from './App.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en: translations.en, pt: translations.pt }
});

const vuetify = createVuetify({ components, directives });

createApp(App).use(vuetify).use(i18n).mount('#app');
