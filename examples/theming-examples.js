/**
 * Comprehensive Theming Examples for Vue Google Calendar
 * 
 * This file contains various theme examples demonstrating
 * the full customization capabilities of the calendar component.
 */

import { DEFAULT_THEME } from '../src/config/theme.js';

/**
 * EXAMPLE 1: Corporate Brand Theme
 * 
 * A professional theme using corporate brand colors.
 * Demonstrates: Brand color application, custom fonts
 */
export const CORPORATE_THEME = {
  ...DEFAULT_THEME,
  // Brand Colors
  '--calendar-primary-color': '#0066cc',
  '--calendar-primary-hover': '#0052a3',
  '--calendar-today-bg': '#0066cc',
  '--calendar-today-color': '#ffffff',
  
  // Backgrounds
  '--calendar-bg': '#ffffff',
  '--calendar-header-bg': '#f0f4f8',
  '--calendar-day-bg': '#ffffff',
  '--calendar-day-hover-bg': '#e6f2ff',
  
  // Borders
  '--calendar-border-color': '#cbd5e0',
  '--calendar-border-color-dark': '#a0aec0',
  
  // Text
  '--calendar-text-primary': '#1a202c',
  '--calendar-text-secondary': '#4a5568',
  
  // Typography
  '--calendar-font-family': '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  '--calendar-font-weight-medium': '600',
  
  // Rounded corners for modern look
  '--calendar-border-radius': '8px',
  '--calendar-event-border-radius': '8px'
};

/**
 * EXAMPLE 2: Material Design Theme (Indigo/Pink)
 * 
 * Based on Material Design color palette.
 * Demonstrates: Material Design principles, complementary colors
 */
export const MATERIAL_INDIGO_THEME = {
  ...DEFAULT_THEME,
  // Material Indigo
  '--calendar-primary-color': '#3f51b5',
  '--calendar-primary-hover': '#303f9f',
  '--calendar-today-bg': '#3f51b5',
  '--calendar-today-color': '#ffffff',
  
  // Backgrounds
  '--calendar-bg': '#fafafa',
  '--calendar-header-bg': '#e8eaf6',
  '--calendar-day-bg': '#ffffff',
  '--calendar-day-hover-bg': '#f5f5f5',
  
  // Accent color for secondary elements
  '--calendar-current-time-color': '#ff4081', // Material Pink
  
  // Borders
  '--calendar-border-color': '#e0e0e0',
  '--calendar-border-color-dark': '#bdbdbd',
  
  // Text
  '--calendar-text-primary': '#212121',
  '--calendar-text-secondary': '#757575',
  
  // Typography
  '--calendar-font-family': '"Roboto", "Helvetica", "Arial", sans-serif'
};

/**
 * EXAMPLE 3: Dark Mode Theme
 * 
 * A sleek dark theme for low-light environments.
 * Demonstrates: Dark color scheme, high contrast for readability
 */
export const DARK_THEME = {
  ...DEFAULT_THEME,
  // Dark Backgrounds
  '--calendar-bg': '#1e1e1e',
  '--calendar-header-bg': '#2d2d2d',
  '--calendar-day-bg': '#1e1e1e',
  '--calendar-day-other-month-bg': '#252525',
  '--calendar-day-hover-bg': '#2d2d2d',
  
  // Dark Borders
  '--calendar-border-color': '#3a3a3a',
  '--calendar-border-color-dark': '#4a4a4a',
  
  // Light Text
  '--calendar-text-primary': '#e0e0e0',
  '--calendar-text-secondary': '#b0b0b0',
  '--calendar-text-disabled': '#808080',
  
  // Accent Colors
  '--calendar-primary-color': '#4dabf7',
  '--calendar-primary-hover': '#339af0',
  '--calendar-today-bg': '#4dabf7',
  '--calendar-today-color': '#1e1e1e',
  
  // Current Time
  '--calendar-current-time-color': '#ff6b6b',
  
  // Event styling
  '--calendar-event-hover-opacity': '0.9'
};

/**
 * EXAMPLE 4: High Contrast (Accessibility)
 * 
 * Maximum contrast for users with visual impairments.
 * Demonstrates: WCAG AAA compliance, accessibility features
 */
export const HIGH_CONTRAST_THEME = {
  ...DEFAULT_THEME,
  // Pure white/black for maximum contrast
  '--calendar-bg': '#ffffff',
  '--calendar-header-bg': '#ffffff',
  '--calendar-day-bg': '#ffffff',
  
  // Black borders
  '--calendar-border-color': '#000000',
  '--calendar-border-color-dark': '#000000',
  
  // Black text
  '--calendar-text-primary': '#000000',
  '--calendar-text-secondary': '#000000',
  '--calendar-text-disabled': '#555555',
  
  // High contrast accents
  '--calendar-primary-color': '#000000',
  '--calendar-primary-hover': '#333333',
  '--calendar-today-bg': '#000000',
  '--calendar-today-color': '#ffffff',
  
  // Bright red for time indicator
  '--calendar-current-time-color': '#ff0000',
  
  // Larger fonts for readability
  '--calendar-font-size-base': '16px',
  '--calendar-font-size-small': '14px',
  '--calendar-font-weight-medium': '700',
  
  // No rounded corners (clearer boundaries)
  '--calendar-border-radius': '0px',
  '--calendar-event-border-radius': '0px'
};

/**
 * EXAMPLE 5: Compact Theme
 * 
 * Space-efficient theme for small screens or dense layouts.
 * Demonstrates: Reduced spacing, smaller fonts, efficiency
 */
export const COMPACT_THEME = {
  ...DEFAULT_THEME,
  // Reduced Spacing
  '--calendar-spacing-xs': '1px',
  '--calendar-spacing-sm': '2px',
  '--calendar-spacing-md': '4px',
  '--calendar-spacing-lg': '6px',
  '--calendar-spacing-xl': '8px',
  '--calendar-spacing-xxl': '12px',
  
  // Smaller Header
  '--calendar-header-padding': '8px 12px',
  '--calendar-header-gap': '6px',
  
  // Smaller Fonts
  '--calendar-font-size-base': '12px',
  '--calendar-font-size-small': '11px',
  '--calendar-font-size-xsmall': '10px',
  
  // Compact Hour Slots
  '--calendar-pixels-per-hour-week': '40px',
  '--calendar-pixels-per-hour-day': '32px',
  '--calendar-pixels-per-hour-week-mobile': '35px',
  '--calendar-pixels-per-hour-day-mobile': '28px',
  
  // Smaller Time Column
  '--calendar-time-column-width': '50px',
  '--calendar-time-column-width-mobile': '40px',
  
  // Compact Events
  '--calendar-event-padding': '1px 4px',
  '--calendar-event-font-size': '10px',
  '--calendar-event-border-radius': '4px',
  
  // Smaller Day Numbers
  '--calendar-day-number-size': '20px',
  '--calendar-day-number-font-size': '11px'
};

/**
 * EXAMPLE 6: Pastel/Soft Theme
 * 
 * Gentle colors for a calm, pleasing aesthetic.
 * Demonstrates: Soft color palette, reduced contrast
 */
export const PASTEL_THEME = {
  ...DEFAULT_THEME,
  // Soft Backgrounds
  '--calendar-bg': '#fef9f3',
  '--calendar-header-bg': '#fef6ec',
  '--calendar-day-bg': '#fffcf8',
  '--calendar-day-hover-bg': '#fff4e6',
  
  // Soft Borders
  '--calendar-border-color': '#f0e6d6',
  '--calendar-border-color-dark': '#e8d9c4',
  
  // Muted Text
  '--calendar-text-primary': '#5c4a42',
  '--calendar-text-secondary': '#8b7a6f',
  
  // Pastel Accents
  '--calendar-primary-color': '#a88f82',
  '--calendar-primary-hover': '#9b8176',
  '--calendar-today-bg': '#a88f82',
  '--calendar-today-color': '#ffffff',
  
  // Soft current time indicator
  '--calendar-current-time-color': '#e89f71',
  
  // Soft typography
  '--calendar-font-family': '"Nunito", "Comic Sans MS", cursive'
};

/**
 * EXAMPLE 7: Neon/Vibrant Theme
 * 
 * Bold, eye-catching colors for modern applications.
 * Demonstrates: High saturation, bold contrasts
 */
export const NEON_THEME = {
  ...DEFAULT_THEME,
  // Dark base for neon colors
  '--calendar-bg': '#0a0a0a',
  '--calendar-header-bg': '#1a1a1a',
  '--calendar-day-bg': '#0a0a0a',
  '--calendar-day-hover-bg': '#1a1a1a',
  
  // Neon borders
  '--calendar-border-color': '#00ffff',
  '--calendar-border-color-dark': '#00cccc',
  
  // Bright text
  '--calendar-text-primary': '#ffffff',
  '--calendar-text-secondary': '#00ffff',
  
  // Neon accents
  '--calendar-primary-color': '#ff00ff',
  '--calendar-primary-hover': '#cc00cc',
  '--calendar-today-bg': '#00ff00',
  '--calendar-today-color': '#000000',
  
  // Bright current time
  '--calendar-current-time-color': '#ff3366',
  
  // Bold font
  '--calendar-font-weight-medium': '700'
};

/**
 * EXAMPLE 8: Minimalist Theme
 * 
 * Clean, simple design with minimal visual noise.
 * Demonstrates: Monochrome palette, simplicity
 */
export const MINIMALIST_THEME = {
  ...DEFAULT_THEME,
  // Monochrome
  '--calendar-bg': '#ffffff',
  '--calendar-header-bg': '#ffffff',
  '--calendar-day-bg': '#ffffff',
  '--calendar-day-hover-bg': '#f5f5f5',
  
  // Subtle borders
  '--calendar-border-color': '#e0e0e0',
  '--calendar-border-color-dark': '#d0d0d0',
  
  // Grayscale text
  '--calendar-text-primary': '#2c3e50',
  '--calendar-text-secondary': '#7f8c8d',
  
  // Minimal accent
  '--calendar-primary-color': '#34495e',
  '--calendar-primary-hover': '#2c3e50',
  '--calendar-today-bg': '#34495e',
  '--calendar-today-color': '#ffffff',
  
  // Subtle current time
  '--calendar-current-time-color': '#95a5a6',
  
  // Clean typography
  '--calendar-font-family': '"Helvetica Neue", "Arial", sans-serif',
  
  // No rounded corners
  '--calendar-border-radius': '0px',
  '--calendar-border-radius-sm': '0px',
  '--calendar-border-radius-md': '0px',
  '--calendar-event-border-radius': '0px'
};

/**
 * EXAMPLE 9: Seasonal Theme - Autumn
 * 
 * Warm, earthy tones inspired by fall season.
 * Demonstrates: Themed color coordination
 */
export const AUTUMN_THEME = {
  ...DEFAULT_THEME,
  // Autumn Backgrounds
  '--calendar-bg': '#fdf6e3',
  '--calendar-header-bg': '#f4e5d3',
  '--calendar-day-bg': '#fffef9',
  '--calendar-day-hover-bg': '#fef5e7',
  
  // Warm borders
  '--calendar-border-color': '#d4a574',
  '--calendar-border-color-dark': '#c89563',
  
  // Earthy text
  '--calendar-text-primary': '#5d4037',
  '--calendar-text-secondary': '#8d6e63',
  
  // Autumn accents
  '--calendar-primary-color': '#d84315',
  '--calendar-primary-hover': '#bf360c',
  '--calendar-today-bg': '#ff6f00',
  '--calendar-today-color': '#ffffff',
  
  // Orange current time
  '--calendar-current-time-color': '#ff9800',
  
  // Warm font
  '--calendar-font-family': '"Georgia", serif'
};

/**
 * EXAMPLE 10: Blueprint/Technical Theme
 * 
 * Engineering/technical aesthetic with grid-like appearance.
 * Demonstrates: Professional technical styling
 */
export const BLUEPRINT_THEME = {
  ...DEFAULT_THEME,
  // Blueprint blue background
  '--calendar-bg': '#1e3a5f',
  '--calendar-header-bg': '#2c5282',
  '--calendar-day-bg': '#1e3a5f',
  '--calendar-day-hover-bg': '#2c5282',
  
  // Grid-like borders
  '--calendar-border-color': '#4a90e2',
  '--calendar-border-color-dark': '#5aa3ff',
  
  // White text
  '--calendar-text-primary': '#ffffff',
  '--calendar-text-secondary': '#a3c9ff',
  
  // Bright accents
  '--calendar-primary-color': '#00d4ff',
  '--calendar-primary-hover': '#00b8e6',
  '--calendar-today-bg': '#00d4ff',
  '--calendar-today-color': '#1e3a5f',
  
  // Bright current time
  '--calendar-current-time-color': '#00ff88',
  
  // Technical font
  '--calendar-font-family': '"Courier New", monospace'
};

/**
 * Usage Example:
 * 
 * import { CORPORATE_THEME, DARK_THEME } from './examples/theming-examples.js';
 * 
 * <Calendar :calendar-app="app" :theme="CORPORATE_THEME" />
 * 
 * // Or create your own by extending
 * const myTheme = {
 *   ...CORPORATE_THEME,
 *   '--calendar-primary-color': '#custom-color'
 * };
 */

// Export all themes
export default {
  CORPORATE_THEME,
  MATERIAL_INDIGO_THEME,
  DARK_THEME,
  HIGH_CONTRAST_THEME,
  COMPACT_THEME,
  PASTEL_THEME,
  NEON_THEME,
  MINIMALIST_THEME,
  AUTUMN_THEME,
  BLUEPRINT_THEME
};
