import { ref } from 'vue';

export function createSwipeTransitionController(targetSelector, { isEnabled, onPanStart, onPanMove, onPanEnd } = {}) {
  const hammerInstance = ref(null);
  const scheduledInitializationTimeoutIds = ref([]);
  let isActiveHorizontalPan = false;

  function clearScheduledInitializations() {
    scheduledInitializationTimeoutIds.value.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    scheduledInitializationTimeoutIds.value = [];
  }

  function destroySwipeTransitionGestures() {
    clearScheduledInitializations();
    if (hammerInstance.value) {
      hammerInstance.value.destroy();
      hammerInstance.value = null;
    }
  }

  function initializeSwipeTransitionGestures(isMobile) {
    if (typeof window === 'undefined' || !window.Hammer || !isMobile) {
      destroySwipeTransitionGestures();
      return false;
    }

    const target = document.querySelector(targetSelector);
    if (!target) return false;

    destroySwipeTransitionGestures();

    try {
      // Use a Manager so we can explicitly configure pan/swipe and keep vertical scrolling.
      const hammer = new window.Hammer.Manager(target, {
        touchAction: 'pan-y',
        recognizers: [
          [window.Hammer.Pan, { direction: window.Hammer.DIRECTION_HORIZONTAL, threshold: 8 }],
          [window.Hammer.Swipe, { direction: window.Hammer.DIRECTION_HORIZONTAL, threshold: 10, velocity: 0.3 }]
        ]
      });

      const isSinglePointer = (event) => (event?.pointers?.length ?? event?.maxPointers ?? 1) <= 1;

      const isCurrentlyEnabled = () => (typeof isEnabled === 'function' ? isEnabled() : true);

      const shouldStartHorizontalPan = (event) => {
        if (!isCurrentlyEnabled()) return false;
        if (!isSinglePointer(event)) return false;

        const dx = Math.abs(Number(event?.deltaX ?? 0));
        const dy = Math.abs(Number(event?.deltaY ?? 0));

        // Avoid stealing vertical scroll gestures: only start swipe when horizontal intent is clear.
        if (dy > dx * 1.2) return false;
        return true;
      };

      hammer.on('panstart', (event) => {
        if (!shouldStartHorizontalPan(event)) return;
        isActiveHorizontalPan = true;
        onPanStart?.(event);
      });

      hammer.on('panmove', (event) => {
        if (!isActiveHorizontalPan) return;
        if (!isCurrentlyEnabled() || !isSinglePointer(event)) {
          isActiveHorizontalPan = false;
          onPanEnd?.(event);
          return;
        }
        onPanMove?.(event);
      });

      hammer.on('panend pancancel', (event) => {
        if (!isActiveHorizontalPan) return;
        isActiveHorizontalPan = false;
        if (!isCurrentlyEnabled() || !isSinglePointer(event)) return;
        onPanEnd?.(event);
      });

      // Fallback: if a fast flick is detected as swipe without meaningful panmove,
      // forward it through panend handler so navigation still happens.
      hammer.on('swipeleft swiperight', (event) => {
        if (!isCurrentlyEnabled()) return;
        if (!isSinglePointer(event)) return;
        onPanEnd?.(event);
      });

      hammerInstance.value = hammer;
      return true;
    } catch (error) {
      console.error('Failed to initialize swipe transition gestures', error);
      return false;
    }
  }

  function scheduleSwipeTransitionInitialization(isMobile) {
    clearScheduledInitializations();
    const attempts = [0, 100, 500, 1000];
    attempts.forEach((delay) => {
      const timeoutId = setTimeout(() => {
        scheduledInitializationTimeoutIds.value = scheduledInitializationTimeoutIds.value.filter(
          (id) => id !== timeoutId,
        );
        initializeSwipeTransitionGestures(isMobile);
      }, delay);
      scheduledInitializationTimeoutIds.value.push(timeoutId);
    });
  }

  return {
    hammerInstance,
    initializeSwipeTransitionGestures,
    destroySwipeTransitionGestures,
    scheduleSwipeTransitionInitialization
  };
}
