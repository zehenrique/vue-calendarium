/**
 * Predefined color palette for the calendar.
 * These are the only colors available for calendars and events.
 * Based on a Material Design color palette.
 */

export const CALENDAR_COLORS = [
  { id: 'tomato', name: 'Tomato', hex: '#D50000' },
  { id: 'flamingo', name: 'Flamingo', hex: '#E67C73' },
  { id: 'tangerine', name: 'Tangerine', hex: '#F4511E' },
  { id: 'banana', name: 'Banana', hex: '#F6BF26' },
  { id: 'sage', name: 'Sage', hex: '#33B679' },
  { id: 'basil', name: 'Basil', hex: '#0B8043' },
  { id: 'peacock', name: 'Peacock', hex: '#039BE5' },
  { id: 'blueberry', name: 'Blueberry', hex: '#3F51B5' },
  { id: 'lavender', name: 'Lavender', hex: '#7986CB' },
  { id: 'grape', name: 'Grape', hex: '#8E24AA' },
  { id: 'graphite', name: 'Graphite', hex: '#616161' },
  { id: 'cobalt', name: 'Cobalt', hex: '#1967D2' } // Default
];

/**
 * Default color for new calendars and events
 */
export const DEFAULT_COLOR = '#1967D2'; // Cobalt

/**
 * Get color hex by ID
 * @param {string} colorId - The color ID
 * @returns {string} The hex color code
 */
export function getColorById(colorId) {
  const color = CALENDAR_COLORS.find(c => c.id === colorId);
  return color ? color.hex : DEFAULT_COLOR;
}

/**
 * Get color ID by hex code
 * @param {string} hex - The hex color code
 * @returns {string} The color ID or null if not found
 */
export function getColorIdByHex(hex) {
  const normalizedHex = hex.toUpperCase();
  const color = CALENDAR_COLORS.find(c => c.hex.toUpperCase() === normalizedHex);
  return color ? color.id : null;
}

/**
 * Validate if a hex color is in the allowed palette
 * @param {string} hex - The hex color code
 * @returns {boolean} True if the color is valid
 */
export function isValidColor(hex) {
  const normalizedHex = hex.toUpperCase();
  return CALENDAR_COLORS.some(c => c.hex.toUpperCase() === normalizedHex);
}

/**
 * Get the closest allowed color from the palette
 * @param {string} hex - Any hex color code
 * @returns {string} The closest color from the palette
 */
export function getClosestColor(hex) {
  // If it's already in the palette, return it
  if (isValidColor(hex)) {
    return hex.toUpperCase();
  }
  
  // Otherwise, return the default color
  // In a more sophisticated implementation, we could calculate
  // the closest color using color distance algorithms
  return DEFAULT_COLOR;
}
