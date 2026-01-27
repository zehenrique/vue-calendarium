import { describe, expect, it } from 'vitest';
import { createCalendar } from '../../src/core/createCalendar.js';
import { createViewDay, createViewMonth, createViewWeek } from '../../src/core/views.js';

describe('createCalendar feature toggles', () => {
  it('defaults toggles to enabled', () => {
    const calendarApp = createCalendar({
      views: [createViewDay(), createViewWeek(), createViewMonth()],
      events: [],
      calendars: []
    });

    expect(calendarApp.enableModals.value).toBe(true);
    expect(calendarApp.enableMobileSidebar.value).toBe(true);
    expect(calendarApp.enableDragAndDrop.value).toBe(false);

    expect(calendarApp.enableSwipeGestures.value).toBe(true);
    expect(calendarApp.enablePinchToZoom.value).toBe(true);
    expect(calendarApp.enableCurrentTimeIndicator.value).toBe(true);
  });

  it('respects explicit toggle config', () => {
    const calendarApp = createCalendar({
      views: [createViewDay(), createViewWeek(), createViewMonth()],
      events: [],
      calendars: [],
      enableModals: false,
      enableMobileSidebar: false,
      enableDragAndDrop: true,
      enableSwipeGestures: false,
      enablePinchToZoom: false,
      enableCurrentTimeIndicator: false
    });

    expect(calendarApp.enableModals.value).toBe(false);
    expect(calendarApp.enableMobileSidebar.value).toBe(false);
    expect(calendarApp.enableDragAndDrop.value).toBe(true);

    expect(calendarApp.enableSwipeGestures.value).toBe(false);
    expect(calendarApp.enablePinchToZoom.value).toBe(false);
    expect(calendarApp.enableCurrentTimeIndicator.value).toBe(false);
  });
});
