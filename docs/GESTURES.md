# Touch gestures

On mobile the calendar responds to three gestures:

| Gesture | Where | What it does |
| --- | --- | --- |
| [Swipe](#swipe-to-navigate) left or right | Month, week and day views | Goes to the next or previous month, week or day |
| [Pinch](#pinch-to-zoom) | Week and day views | Zooms the time grid in or out |
| [Swipe left](#closing-the-side-menu) | Side menu | Closes the menu |

All gestures are for the [mobile layout](./MOBILE.md), meaning windows narrower than 768px. They are handled with [Hammer.js](https://hammerjs.github.io/), which the calendar loads for you, in the browser only. Your app does not need to load or configure it, and the package can still be imported in server-side rendering.

```js
const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  enableSwipeGestures: true,   // default
  enablePinchToZoom: true      // default
});
```

## Swipe to navigate

Drag a finger sideways across the calendar. The current page follows your finger, and the next or previous one slides in next to it.

- Swipe **left** for the next day, week or month. Swipe **right** for the previous one.
- When you let go, the page changes if you dragged more than about a fifth of the screen's width (22%) or flicked quickly. Otherwise it springs back.
- The slide takes about 0.2 seconds.
- The scroll position of the time grid is kept, so after swiping to the next week you are still looking at the same hours.

Vertical scrolling is not affected. A drag only counts as a swipe when it is mostly horizontal, so scrolling the time grid up and down never changes the page.

A swipe does nothing while:

- the side menu or any dialog is open,
- two fingers are on the screen (a pinch), or in the moment right after a pinch ends,
- the calendar is not in the mobile layout.

### Without swipe

On a phone, swiping is how users move between periods, so the mobile header has no previous and next buttons. When you set `enableSwipeGestures: false`, the header shows previous and next buttons instead, next to **Today**.

### Reduced motion

When the device is set to reduce motion (`prefers-reduced-motion`), a swipe still follows your finger, but the page changes straight away instead of sliding.

## Pinch to zoom

In the week and day views, pinch two fingers apart to make the hours taller, or together to make them shorter. Zooming shows more detail for busy days, or more of the day at once.

- The time under your fingers stays where it is while you zoom, instead of jumping.
- Zooming keeps going for a moment after you let go, like a flick.
- Each view has its own zoom limits, measured as the height of one hour:

  | View | Smallest | Default | Largest |
  | --- | --- | --- | --- |
  | Week | 30px | 45px | 150px |
  | Day | 25px | 34px | 75px |

- The zoom level is **saved in the browser** (`localStorage`, under the keys `calendar-zoom-week-mobile` and `calendar-zoom-day-mobile`), so it is still there next time. To reset it, clear that site data.
- The month view does not zoom.

On desktop, the hour height is fixed (54px in the week view and about 40px in the day view).

## Closing the side menu

With the side menu open, swipe it to the left. The menu follows your finger and closes when you drag it more than about 130px, or flick it quickly. Otherwise it springs back. On phones that support it, a short vibration confirms the close.

The menu cannot be opened by swiping. Use the menu button in the header.

## Trying gestures on a computer

- **Swipe** also works with the mouse when the window is narrower than 768px: press and drag sideways.
- **Pinch** needs two touch points. Use your browser's device emulation in DevTools, or a real phone or tablet.

## Gestures in single-page apps

The calendar sets its gestures up when it appears and removes them when it leaves, so moving between routes in a router does not leave stale handlers behind. If you move the calendar between pages, no extra work is needed. For details, see [Mobile Gestures in SPA Navigation](./USAGE.md#mobile-gestures-in-spa-navigation).

## Why a gesture might not work

See [Troubleshooting](./TROUBLESHOOTING.md#touch-gestures-do-nothing).
