import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import messages from './i18n.js';
import './style.css';

// Create i18n instance
// Default locale is 'en', but Calendar component can override via props
const i18n = createI18n({
  legacy: false,
  locale: 'en', // Default: en-US
  fallbackLocale: 'en',
  messages
});

// Create Vue app
const app = createApp(App);

app.use(i18n);
app.mount('#app');
