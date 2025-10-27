import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import messages from './i18n.js';
import './style.css';

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages
});

// Create Vue app
const app = createApp(App);

app.use(i18n);
app.mount('#app');
