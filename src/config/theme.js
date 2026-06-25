/**
 * Default theme configuration for the vue-calendarium component.
 * All CSS custom properties (variables) are defined here.
 * Users can override these by passing a custom theme object or by defining
 * CSS variables in their parent component's styles.
 */

export const CALENDAR_FONT_FAMILY = "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export const DEFAULT_THEME = {
  // ============================================
  // COLORS
  // ============================================
  
  // Background colors
  '--calendar-bg': '#ffffff',
  '--calendar-header-bg': '#f8f9fa',
  '--calendar-day-bg': '#ffffff',
  '--calendar-day-other-month-bg': '#fafafa',
  '--calendar-day-hover-bg': '#f8f9fa',
  
  // Border colors
  '--calendar-border-color': '#e0e0e0',
  '--calendar-border-color-dark': '#d0d0d0',
  
  // Text colors
  '--calendar-text-primary': '#3c4043',
  '--calendar-text-secondary': '#70757a',
  '--calendar-text-disabled': '#5f6368',
  
  // Accent colors
  '--calendar-primary-color': '#1a73e8',
  '--calendar-primary-hover': '#1557b0',
  '--calendar-today-bg': '#1a73e8',
  '--calendar-today-color': '#ffffff',
  
  // Current time indicator
  '--calendar-current-time-color': '#ea4335',
  '--calendar-current-time-circle-size': '12px',
  
  // Event colors (default fallback)
  '--calendar-event-bg': '#1967d2',
  '--calendar-event-color': '#ffffff',
  '--calendar-event-hover-opacity': '0.8',
  '--calendar-ghost-event-opacity': '0.5',
  
  // ============================================
  // TYPOGRAPHY
  // ============================================
  
  '--calendar-font-family': CALENDAR_FONT_FAMILY,
  '--calendar-font-size-base': '14px',
  '--calendar-font-size-small': '12px',
  '--calendar-font-size-xsmall': '11px',
  '--calendar-font-size-large': '16px',
  '--calendar-font-size-title': '1.25rem',
  
  '--calendar-font-weight-normal': '400',
  '--calendar-font-weight-medium': '500',
  
  // ============================================
  // SPACING
  // ============================================
  
  '--calendar-spacing-xs': '2px',
  '--calendar-spacing-sm': '4px',
  '--calendar-spacing-md': '8px',
  '--calendar-spacing-lg': '12px',
  '--calendar-spacing-xl': '16px',
  '--calendar-spacing-xxl': '20px',
  
  // ============================================
  // SIZING
  // ============================================
  
  // Header
  '--calendar-header-padding': '16px 20px',
  '--calendar-header-gap': '12px',
  '--calendar-header-border-width': '1px',
  
  // Time column
  '--calendar-time-column-width': '60px',
  '--calendar-time-column-width-mobile': '50px',
  
  // Day numbers
  '--calendar-day-number-size': '24px',
  '--calendar-day-number-font-size': '12px',
  
  // Week day headers
  '--calendar-week-day-number-size': '36px',
  '--calendar-week-day-number-size-mobile': '32px',
  '--calendar-week-day-font-size': '11px',
  '--calendar-week-day-font-size-mobile': '10px',
  
  // Event elements
  '--calendar-event-padding': '2px 6px',
  '--calendar-event-border-radius': '6px',
  '--calendar-event-font-size': '11px',
  '--calendar-event-font-size-mobile': '10px',
  '--calendar-event-line-height': '1.2',
  '--calendar-event-max-height': '20px',
  '--calendar-event-gap': '2px',
  
  // All-day events
  '--calendar-all-day-min-height': '20px',
  '--calendar-all-day-padding': '4px',
  '--calendar-all-day-event-padding': '2px 8px',
  '--calendar-all-day-event-padding-mobile': '2px 1px',
  '--calendar-all-day-event-font-size': '12px',
  '--calendar-all-day-event-font-size-mobile': '8.5px',
  '--calendar-all-day-event-border-radius': '8px',
  '--calendar-all-day-event-border-radius-mobile': '5px',
  
  // Grid
  '--calendar-grid-gap': '1px',
  '--calendar-pixels-per-hour-week': '60px',
  '--calendar-pixels-per-hour-week-mobile': '50px',
  '--calendar-pixels-per-hour-day': '45px',
  '--calendar-pixels-per-hour-day-mobile': '38px',
  
  // ============================================
  // BORDERS & RADIUS
  // ============================================
  
  '--calendar-border-radius': '4px',
  '--calendar-border-radius-sm': '6px',
  '--calendar-border-radius-md': '8px',
  '--calendar-border-radius-lg': '12px',
  '--calendar-border-radius-circle': '50%',
  
  // ============================================
  // TRANSITIONS
  // ============================================
  
  '--calendar-transition-fast': '0.2s',
  '--calendar-transition-medium': '0.3s',
  
  // ============================================
  // Z-INDEX
  // ============================================
  
  '--calendar-header-z-index': '10',
  '--calendar-event-z-index': '1',
  '--calendar-current-time-z-index': '5',
  
  // ============================================
  // MOBILE SPECIFIC
  // ============================================
  
  '--calendar-mobile-breakpoint': '768px',
  '--calendar-mobile-header-padding': '2px 2px',
  '--calendar-mobile-header-gap': '8px',
  '--calendar-mobile-day-number-font-size': '11px',
  '--calendar-mobile-event-font-size': '10px',
  
  // ============================================
  // DAY VIEW SPECIFIC
  // ============================================
  
  '--calendar-day-view-weekday-font-size': '11px',
  '--calendar-day-view-number-font-size': '26px',
  '--calendar-day-view-number-margin-top': '2px',
};

/**
 * Applies theme to a DOM element as CSS custom properties.
 * @param {HTMLElement} element - The element to apply the theme to
 * @param {Object} theme - Theme object with CSS custom properties
 */
export function applyTheme(element, theme = DEFAULT_THEME) {
  if (!element) return;
  
  Object.entries(theme).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

/**
 * Merges user theme with default theme.
 * @param {Object} userTheme - User-provided theme overrides
 * @returns {Object} Merged theme object
 */
export function mergeTheme(userTheme = {}) {
  return {
    ...DEFAULT_THEME,
    ...userTheme
  };
}

/**
 * Generates a CSS string from a theme object.
 * @param {Object} theme - Theme object
 * @returns {string} CSS string with custom properties
 */
export function generateThemeCSS(theme = DEFAULT_THEME) {
  const properties = Object.entries(theme)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');
  
  return `.vue-calendarium {\n${properties}\n}`;
}

/**
 * Theme presets for common use cases
 */
export const THEME_PRESETS = {
  default: DEFAULT_THEME,
  
  // Dark theme preset
  dark: {
    ...DEFAULT_THEME,
    '--calendar-bg': '#202124',
    '--calendar-header-bg': '#292a2d',
    '--calendar-day-bg': '#202124',
    '--calendar-day-other-month-bg': '#28292c',
    '--calendar-day-hover-bg': '#28292c',
    '--calendar-border-color': '#3c4043',
    '--calendar-border-color-dark': '#5f6368',
    '--calendar-text-primary': '#e8eaed',
    '--calendar-text-secondary': '#9aa0a6',
    '--calendar-text-disabled': '#80868b',
  },
  
  // Compact theme with smaller spacing
  compact: {
    ...DEFAULT_THEME,
    '--calendar-header-padding': '12px 16px',
    '--calendar-header-gap': '8px',
    '--calendar-spacing-xs': '1px',
    '--calendar-spacing-sm': '2px',
    '--calendar-spacing-md': '4px',
    '--calendar-spacing-lg': '8px',
    '--calendar-spacing-xl': '12px',
    '--calendar-spacing-xxl': '16px',
    '--calendar-event-padding': '1px 4px',
    '--calendar-event-font-size': '10px',
    '--calendar-pixels-per-hour-week': '48px',
    '--calendar-pixels-per-hour-day': '36px',
  },
  
  // High contrast theme for accessibility
  highContrast: {
    ...DEFAULT_THEME,
    '--calendar-bg': '#ffffff',
    '--calendar-border-color': '#000000',
    '--calendar-border-color-dark': '#000000',
    '--calendar-text-primary': '#000000',
    '--calendar-text-secondary': '#000000',
    '--calendar-today-bg': '#000000',
    '--calendar-primary-color': '#000000',
  }
};
