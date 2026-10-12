// hammerjs reads `window` and `document` as soon as it is imported, so it is loaded lazily
// and only in the browser. This keeps the package safe to import during SSR.
let hammerPromise = null;

/**
 * Load Hammer.js for touch gestures (swipe, pinch, sidebar swipe-to-close).
 * @returns {Promise<Function|null>} The Hammer constructor, or null outside the browser or if loading fails
 */
export function loadHammer() {
  if (typeof window === 'undefined') return Promise.resolve(null);

  if (!hammerPromise) {
    hammerPromise = import('hammerjs')
      .then((module) => module.default ?? module)
      .catch((error) => {
        console.error('Failed to load hammerjs; touch gestures are disabled', error);
        return null;
      });
  }
  return hammerPromise;
}
