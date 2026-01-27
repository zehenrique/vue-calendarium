import { ref, computed } from 'vue';

/**
 * Zoom level ranges for different views (in pixels per hour)
 */
const ZOOM_RANGES = {
  week: {
    mobile: { min: 30, default: 45, max: 90 },
    desktop: { min: 40, default: 54, max: 108 }
  },
  day: {
    mobile: { min: 25, default: 34.2, max: 75 },
    desktop: { min: 30, default: 40.5, max: 81 }
  }
};

/**
 * Composable for pinch-to-zoom functionality in calendar views
 * Allows users to zoom in/out by pinching on mobile devices
 * 
 * @param {string} targetSelector - CSS selector for the target element
 * @param {Object} options - Configuration options
 * @param {Function} options.onZoomChange - Callback when zoom level changes
 * @returns {Object} Pinch-to-zoom controller methods and state
 */
export function createPinchToZoomController(targetSelector, { onZoomChange, onPinchStart, onPinchEnd } = {}) {
  const hammerInstance = ref(null);
  const isZooming = ref(false);
  const baseScale = ref(1);
  const currentScale = ref(1);
  const rafId = ref(null);
  const isInertiaActive = ref(false);
  const detachTouchBlockers = ref(null);
  
  // Store zoom levels for different views
  const zoomLevels = ref({
    week: { mobile: ZOOM_RANGES.week.mobile.default, desktop: ZOOM_RANGES.week.desktop.default },
    day: { mobile: ZOOM_RANGES.day.mobile.default, desktop: ZOOM_RANGES.day.desktop.default }
  });

  /**
   * Get zoom range for specific view and device type
   * @param {string} view - 'day' or 'week'
   * @param {boolean} isMobile - Whether in mobile mode
   * @returns {Object} { min, default, max }
   */
  const getZoomRange = (view, isMobile) => {
    const deviceType = isMobile ? 'mobile' : 'desktop';
    return ZOOM_RANGES[view]?.[deviceType] || ZOOM_RANGES.week.mobile;
  };

  /**
   * Get current pixels per hour for a view
   * @param {string} view - 'day' or 'week'
   * @param {boolean} isMobile - Whether in mobile mode
   * @returns {number} Pixels per hour
   */
  const getPixelsPerHour = (view, isMobile) => {
    const deviceType = isMobile ? 'mobile' : 'desktop';
    return zoomLevels.value[view]?.[deviceType] || ZOOM_RANGES[view][deviceType].default;
  };

  /**
   * Set pixels per hour for a view
   * @param {string} view - 'day' or 'week'
   * @param {boolean} isMobile - Whether in mobile mode
   * @param {number} value - New pixels per hour value
   */
  const setPixelsPerHour = (view, isMobile, value) => {
    const deviceType = isMobile ? 'mobile' : 'desktop';
    const range = getZoomRange(view, isMobile);
    
    // Clamp value to min/max range
    const clampedValue = Math.max(range.min, Math.min(range.max, value));
    
    if (!zoomLevels.value[view]) {
      zoomLevels.value[view] = {};
    }
    
    zoomLevels.value[view][deviceType] = clampedValue;
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem(`calendar-zoom-${view}-${deviceType}`, clampedValue.toString());
    } catch (e) {
      console.warn('Failed to persist zoom level:', e);
    }
    
    // Notify of zoom change
    onZoomChange?.({ view, isMobile, pixelsPerHour: clampedValue });
  };

  /**
   * Load saved zoom levels from localStorage
   */
  const loadSavedZoomLevels = () => {
    ['week', 'day'].forEach(view => {
      ['mobile', 'desktop'].forEach(deviceType => {
        try {
          const saved = localStorage.getItem(`calendar-zoom-${view}-${deviceType}`);
          if (saved) {
            const value = parseFloat(saved);
            if (!isNaN(value)) {
              if (!zoomLevels.value[view]) {
                zoomLevels.value[view] = {};
              }
              const range = ZOOM_RANGES[view][deviceType];
              zoomLevels.value[view][deviceType] = Math.max(range.min, Math.min(range.max, value));
            }
          }
        } catch (e) {
          console.warn('Failed to load saved zoom level:', e);
        }
      });
    });
  };

  /**
   * Reset zoom to default for a specific view
   * @param {string} view - 'day' or 'week'
   * @param {boolean} isMobile - Whether in mobile mode
   */
  const resetZoom = (view, isMobile) => {
    const deviceType = isMobile ? 'mobile' : 'desktop';
    const defaultValue = ZOOM_RANGES[view][deviceType].default;
    setPixelsPerHour(view, isMobile, defaultValue);
  };

  /**
   * Destroy pinch gesture handler
   */
  function destroyPinchGestures() {
    if (rafId.value) {
      cancelAnimationFrame(rafId.value);
      rafId.value = null;
    }
    if (hammerInstance.value) {
      hammerInstance.value.destroy();
      hammerInstance.value = null;
    }
    if (detachTouchBlockers.value) {
      detachTouchBlockers.value();
      detachTouchBlockers.value = null;
    }
    isInertiaActive.value = false;
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const nowMs = () => (typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now());

  const getGridTopInScrollContent = (scrollContainer, view) => {
    const selector = view === 'day' ? '.day-column' : '.week-day-column';
    const grid = scrollContainer.querySelector(selector);
    if (!grid) return 0;

    const containerRect = scrollContainer.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    return (gridRect.top - containerRect.top) + scrollContainer.scrollTop;
  };

  const getLocalYInContainer = (scrollContainer, centerY) => {
    const rect = scrollContainer.getBoundingClientRect();
    return centerY - rect.top;
  };

  /**
   * Initialize pinch gesture handler
   * @param {boolean} isMobile - Whether in mobile mode
   * @param {string} currentView - Current calendar view ('day' or 'week')
   * @returns {boolean} Success status
   */
  function initializePinchGestures(isMobile, currentView) {
    // Only enable on mobile
    if (typeof window === 'undefined' || !window.Hammer || !isMobile) {
      console.debug('[PinchZoom] Not initializing:', { hasWindow: typeof window !== 'undefined', hasHammer: !!window.Hammer, isMobile });
      destroyPinchGestures();
      return false;
    }

    // Only enable for day and week views
    if (currentView !== 'day' && currentView !== 'week') {
      console.debug('[PinchZoom] Not initializing - view not supported:', currentView);
      destroyPinchGestures();
      return false;
    }

    const target = document.querySelector(targetSelector);
    if (!target) {
      console.debug('[PinchZoom] Target element not found:', targetSelector);
      return false;
    }

    destroyPinchGestures();

    try {
      // IMPORTANT:
      // - If Hammer computes touchAction for a pinch recognizer it often ends up as 'none',
      //   which disables native scrolling on the element.
      // - We explicitly keep 'pan-y' so one-finger vertical scrolling works.
      const hammer = new window.Hammer.Manager(target, {
        touchAction: 'pan-y',
        recognizers: [
          [window.Hammer.Pinch, { enable: true, threshold: 0 }]
        ]
      });
      
      console.debug('[PinchZoom] Initialized successfully for', currentView, 'view on', targetSelector);
      
      let lastScale = 1;
      let gridTopInScrollContent = 0;
      let pendingTargetPixels = null;
      let pendingCenterY = null;
      let inertiaUntilMs = 0;
      let pinchStartPixels = null;
      let previousTouchAction = null;
      let lastFrameMs = 0;
      let isTwoFingerDown = false;

      const ensureTouchActionNone = () => {
        if (previousTouchAction == null) {
          previousTouchAction = target.style.touchAction;
        }
        target.style.touchAction = 'none';
      };

      const restoreTouchAction = () => {
        if (previousTouchAction != null) {
          target.style.touchAction = previousTouchAction;
          previousTouchAction = null;
        } else {
          target.style.touchAction = '';
        }
      };

      const onTouchStart = (e) => {
        if (e?.touches?.length >= 2) {
          isTwoFingerDown = true;
          ensureTouchActionNone();
        }
      };

      const onTouchMove = (e) => {
        // Key behavior: if there are 2 touches, do NOT allow vertical scroll.
        if (e?.touches?.length >= 2) {
          ensureTouchActionNone();
          try {
            e.preventDefault();
          } catch {
            // ignore
          }
        }
      };

      const onTouchEnd = (e) => {
        if ((e?.touches?.length ?? 0) < 2) {
          isTwoFingerDown = false;
          // If pinch isn't active anymore, restore scrolling.
          if (!isZooming.value && !isInertiaActive.value) {
            restoreTouchAction();
          }
        }
      };

      // Block native scrolling/zooming during a 2-finger interaction so pinch activates reliably.
      // Note: must be passive:false to allow preventDefault.
      target.addEventListener('touchstart', onTouchStart, { passive: false });
      target.addEventListener('touchmove', onTouchMove, { passive: false });
      target.addEventListener('touchend', onTouchEnd, { passive: false });
      target.addEventListener('touchcancel', onTouchEnd, { passive: false });

      detachTouchBlockers.value = () => {
        target.removeEventListener('touchstart', onTouchStart);
        target.removeEventListener('touchmove', onTouchMove);
        target.removeEventListener('touchend', onTouchEnd);
        target.removeEventListener('touchcancel', onTouchEnd);
        restoreTouchAction();
      };

      const applySmoothZoomStep = () => {
        rafId.value = null;
        if ((!isZooming.value && !isInertiaActive.value) || pendingTargetPixels == null || pendingCenterY == null) return;

        const range = getZoomRange(currentView, isMobile);
        const currentPixels = getPixelsPerHour(currentView, isMobile);
        const targetPixels = clamp(pendingTargetPixels, range.min, range.max);

        // Fast but stable smoothing (time-based, never overshoots)
        const frameMs = nowMs();
        const dtMs = lastFrameMs ? Math.min(64, Math.max(0, frameMs - lastFrameMs)) : 16;
        lastFrameMs = frameMs;
        const dtSec = dtMs / 1000;
        const responsiveness = 60;
        const alpha = isZooming.value ? 0.95 : (1 - Math.exp(-responsiveness * dtSec));
        const nextPixels = Math.abs(targetPixels - currentPixels) < 0.05
          ? targetPixels
          : currentPixels + (targetPixels - currentPixels) * alpha;

        // Keep the time under the pinch center stable by adjusting scrollTop.
        // Convert pinch center Y into "minutes" in the time grid.
        const localY = getLocalYInContainer(target, pendingCenterY);
        const yInScrollContent = target.scrollTop + localY;
        const yInGrid = yInScrollContent - gridTopInScrollContent;
        const minutesAtCenter = (yInGrid / currentPixels) * 60;

        setPixelsPerHour(currentView, isMobile, nextPixels);

        const newYInGrid = (minutesAtCenter / 60) * nextPixels;
        const desiredScrollTop = (gridTopInScrollContent + newYInGrid) - localY;
        if (Number.isFinite(desiredScrollTop)) {
          target.scrollTop = desiredScrollTop;
        }

        const isCloseEnough = Math.abs(targetPixels - nextPixels) < 0.05;
        const shouldContinue = !isCloseEnough && (isZooming.value || (isInertiaActive.value && nowMs() < inertiaUntilMs));
        if (shouldContinue) {
          scheduleSmoothZoom();
        } else {
          isInertiaActive.value = false;
          pendingTargetPixels = null;
          pendingCenterY = null;
        }
      };

      const scheduleSmoothZoom = () => {
        if (rafId.value) return;
        rafId.value = requestAnimationFrame(applySmoothZoomStep);
      };

      // Handle pinch start
      hammer.on('pinchstart', (event) => {
        isZooming.value = true;
        onPinchStart?.();
        isInertiaActive.value = false;
        baseScale.value = currentScale.value;
        lastScale = 1;
        pinchStartPixels = getPixelsPerHour(currentView, isMobile);
        lastFrameMs = 0;
        gridTopInScrollContent = getGridTopInScrollContent(target, currentView);
        pendingCenterY = event.center?.y ?? null;

        // When pinch is active, lock out scrolling so the gesture always zooms (any direction).
        ensureTouchActionNone();

        try {
          event?.srcEvent?.preventDefault?.();
        } catch {
          // Ignore if browser disallows
        }
      });

      // Handle pinch move
      hammer.on('pinchmove', (event) => {
        if (!isZooming.value) return;

        // Map directly from pinch start so a single pinch can reach full zoom range.
        const range = getZoomRange(currentView, isMobile);
        const startPixels = pinchStartPixels ?? getPixelsPerHour(currentView, isMobile);
        const scale = Number.isFinite(event.scale) && event.scale > 0 ? event.scale : 1;
        lastScale = scale;
        pendingTargetPixels = clamp(startPixels * scale, range.min, range.max);
        pendingCenterY = event.center?.y ?? pendingCenterY;

        try {
          event?.srcEvent?.preventDefault?.();
        } catch {
          // Ignore if browser disallows
        }

        scheduleSmoothZoom();
      });
      
      // Handle pinch end
      hammer.on('pinchend', () => {
        console.debug('[PinchZoom] Pinch ended');
        isZooming.value = false;
        onPinchEnd?.();
        baseScale.value = 1;
        currentScale.value = 1;
        lastScale = 1;
        pinchStartPixels = null;

        // Restore scrolling behavior (unless there are still 2 touches somehow)
        if (!isTwoFingerDown) {
          restoreTouchAction();
        }

        if (pendingTargetPixels != null && pendingCenterY != null) {
          isInertiaActive.value = true;
          inertiaUntilMs = nowMs() + 180;
          scheduleSmoothZoom();
        } else {
          isInertiaActive.value = false;
          pendingTargetPixels = null;
          pendingCenterY = null;
        }
      });
      
      // Handle pinch cancel
      hammer.on('pinchcancel', () => {
        isZooming.value = false;
        onPinchEnd?.();
        isInertiaActive.value = false;
        baseScale.value = 1;
        currentScale.value = 1;
        lastScale = 1;
        pinchStartPixels = null;
        if (!isTwoFingerDown) {
          restoreTouchAction();
        }
        pendingTargetPixels = null;
        pendingCenterY = null;
      });

      hammerInstance.value = hammer;
      return true;
    } catch (error) {
      console.error('Failed to initialize pinch gestures', error);
      return false;
    }
  }

  /**
   * Schedule pinch gesture initialization with retries
   * @param {boolean} isMobile - Whether in mobile mode
   * @param {string} currentView - Current calendar view
   */
  function schedulePinchInitialization(isMobile, currentView) {
    const attempts = [0, 100, 500, 1000];
    attempts.forEach((delay) => {
      setTimeout(() => {
        initializePinchGestures(isMobile, currentView);
      }, delay);
    });
  }

  // Load saved zoom levels on initialization
  loadSavedZoomLevels();

  return {
    hammerInstance,
    isZooming: computed(() => isZooming.value),
    initializePinchGestures,
    destroyPinchGestures,
    schedulePinchInitialization,
    getPixelsPerHour,
    setPixelsPerHour,
    resetZoom,
    getZoomRange,
    zoomLevels: computed(() => zoomLevels.value)
  };
}
