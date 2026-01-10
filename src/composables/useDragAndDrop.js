import { ref, computed } from 'vue';
import { Temporal } from '@js-temporal/polyfill';

/**
 * Composable for drag and drop functionality in calendar views
 */
export function useDragAndDrop() {
  const isDragging = ref(false);
  const draggedEvent = ref(null);
  const dragStartPosition = ref({ x: 0, y: 0 });
  const currentMousePosition = ref({ x: 0, y: 0 });
  const dragOffset = ref({ x: 0, y: 0 });
  const dropTarget = ref(null); // { date, hour }

  const dragTransform = computed(() => {
    if (!isDragging.value) return '';
    const deltaX = currentMousePosition.value.x - dragStartPosition.value.x;
    const deltaY = currentMousePosition.value.y - dragStartPosition.value.y;
    return `translate(${deltaX}px, ${deltaY}px)`;
  });

  /**
   * Start dragging an event
   * @param {Object} event - The calendar event
   * @param {MouseEvent} mouseEvent - The mouse event
   */
  const startDrag = (event, mouseEvent) => {
    isDragging.value = true;
    draggedEvent.value = event;
    dragStartPosition.value = {
      x: mouseEvent.clientX,
      y: mouseEvent.clientY
    };
    currentMousePosition.value = { ...dragStartPosition.value };
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  };

  /**
   * Update drag position
   * @param {MouseEvent} mouseEvent - The mouse event
   */
  const updateDrag = (mouseEvent) => {
    if (!isDragging.value) return;
    
    currentMousePosition.value = {
      x: mouseEvent.clientX,
      y: mouseEvent.clientY
    };
  };

  /**
   * End dragging
   * @returns {Object|null} - Drop information or null if no valid drop
   */
  const endDrag = () => {
    const result = {
      event: draggedEvent.value,
      dropTarget: dropTarget.value
    };

    // Reset state
    isDragging.value = false;
    draggedEvent.value = null;
    dragStartPosition.value = { x: 0, y: 0 };
    currentMousePosition.value = { x: 0, y: 0 };
    dropTarget.value = null;
    
    // Restore normal cursor and selection
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    return result.dropTarget ? result : null;
  };

  /**
   * Set the drop target (date and hour)
   * @param {Object} target - { date, hour }
   */
  const setDropTarget = (target) => {
    dropTarget.value = target;
  };

  /**
   * Clear the drop target
   */
  const clearDropTarget = () => {
    dropTarget.value = null;
  };

  /**
   * Cancel drag operation
   */
  const cancelDrag = () => {
    isDragging.value = false;
    draggedEvent.value = null;
    dragStartPosition.value = { x: 0, y: 0 };
    currentMousePosition.value = { x: 0, y: 0 };
    dropTarget.value = null;
    
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  return {
    isDragging,
    draggedEvent,
    dragTransform,
    dropTarget,
    startDrag,
    updateDrag,
    endDrag,
    setDropTarget,
    clearDropTarget,
    cancelDrag
  };
}
