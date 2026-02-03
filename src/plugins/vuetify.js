import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { en, pt } from 'vuetify/locale'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Create Vuetify instance with Material Design 3 theme
export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { en, pt }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1967d2',
          secondary: '#5f6368',
          accent: '#fbbc04',
          error: '#d93025',
          info: '#1967d2',
          success: '#137333',
          warning: '#f9ab00',
          background: '#ffffff',
          surface: '#ffffff',
        },
      },
    },
  },
  defaults: {
    global: {
      font: {
        family: "'Roboto', 'Google Sans', 'Product Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      },
    },
    VBtn: {
      style: 'text-transform: none;',
      rounded: 'lg',
    },
    VCard: {
      rounded: 'lg',
      elevation: 2,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VDialog: {
      rounded: 'xl',
    },
  },
})
