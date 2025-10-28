import { ref } from 'vue';

export function createSwipeController(targetSelector, { onSwipeLeft, onSwipeRight } = {}) {
  const hammerInstance = ref(null);

  function destroySwipeGestures() {
    if (hammerInstance.value) {
      hammerInstance.value.destroy();
      hammerInstance.value = null;
    }
  }

  function initializeSwipeGestures(isMobile) {
    if (typeof window === 'undefined' || !window.Hammer || !isMobile) {
      destroySwipeGestures();
      return false;
    }

    const target = document.querySelector(targetSelector);
    if (!target) return false;

    destroySwipeGestures();

    try {
      const hammer = new window.Hammer(target);
      hammer.get('swipe').set({
        direction: window.Hammer.DIRECTION_HORIZONTAL,
        threshold: 30,
        velocity: 0.3
      });

      if (onSwipeLeft) hammer.on('swipeleft', onSwipeLeft);
      if (onSwipeRight) hammer.on('swiperight', onSwipeRight);

      hammerInstance.value = hammer;
      return true;
    } catch (error) {
      console.error('Failed to initialize swipe gestures', error);
      return false;
    }
  }

  function scheduleSwipeInitialization(isMobile) {
    const attempts = [0, 100, 500, 1000];
    attempts.forEach((delay) => {
      setTimeout(() => {
        initializeSwipeGestures(isMobile);
      }, delay);
    });
  }

  return {
    hammerInstance,
    initializeSwipeGestures,
    destroySwipeGestures,
    scheduleSwipeInitialization
  };
}
