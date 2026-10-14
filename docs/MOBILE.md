# Mobile and touch gestures

The calendar has a layout for narrow screens, with [touch gestures](#touch-gestures) to move between periods and zoom the time grid. It switches on by itself, with nothing to configure.

## When the mobile layout is used

The calendar uses the mobile layout when **the browser window is narrower than 768px**. It looks at the window, not at the size of the element the calendar sits in, so a calendar in a narrow panel on a wide screen keeps the desktop layout.

You can try it on a computer by making the browser window narrow.

## What changes on mobile

| | Desktop | Mobile |
| --- | --- | --- |
| Header | **Today**, previous and next, title, view dropdown, date picker | Menu button, title, **Today** icon |
| Switching views | The dropdown in the header | The side menu (or a dropdown in the header, see below) |
| Month view | Up to 4 events per day | Up to 2 events per day, then **+N** |
| All-day events | Full title | Title shortened to 8 characters |
| Day view header | Title only | Weekday and day number next to the title |
| Navigating | Previous and next buttons, date picker | Swipe left or right, and **Today**. With swiping turned off, previous and next buttons appear instead |
| Zooming the time grid | Fixed | Pinch to zoom |
| Event dialogs | Dialogs | Bottom sheets |

## Side menu

The menu button in the header opens a drawer from the left. It lists:

- **Views:** Day, Week and Month, with a check mark on the current one. Choosing a view closes the drawer.
- **Calendars:** a checkbox for each calendar, to show or hide its events.

Close it with the **X**, by tapping the dimmed area, or by swiping it to the left.

Set `enableMobileSidebar: false` to remove the menu and its button. Then users cannot hide calendars from the interface, and, unless you use the header view dropdown below, they cannot change views.

### View selector in the header

By default the views are in the side menu. To put a compact dropdown in the header instead, set `mobileViewSelectorPlacement`:

```js
const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  mobileViewSelectorPlacement: 'header'   // 'sidebar' (default) or 'header'
});
```

## Dialogs and bottom sheets

The create, details, delete and repeat dialogs open as **bottom sheets** that slide up from the bottom, instead of centred dialogs. The create sheet has the same fields as the desktop dialog, with **Cancel**, the title and **Save** at the top. As on desktop, **All day** and the repeat link share a row, and the repeat link moves to its own line when the chosen rule is too long to fit.

Dialogs use Vuetify's own `mobile` flag, which is based on a Vuetify breakpoint and **not** on the 768px window width above. In Vuetify 4 the sheets appear in windows narrower than 1145px by default (1280px with the Vuetify 3 breakpoints, see [Upgrading](./UPGRADING.md#4-check-your-vuetify-breakpoints)). So on a small laptop window, you can get the desktop calendar layout with bottom sheets.

To make the dialogs switch at the same 768px, set Vuetify's mobile breakpoint when you create it. This changes `useDisplay().mobile` for your whole app:

```js
createVuetify({
  display: { mobileBreakpoint: 768 }
})
```

## Sizing

The calendar fills the height of its parent (`height: 100%`) and scrolls the time grid inside itself. Give its parent a height, for example `height: 100vh` or a flex child with `min-height: 0`. See [Troubleshooting](./TROUBLESHOOTING.md#the-calendar-is-empty-or-has-no-height).

The demo page uses this viewport, which stops the browser from zooming the whole page so that a pinch zooms the time grid instead:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
```

`viewport-fit=cover` lets the calendar use the whole screen on phones with a notch. Disabling page zoom has an accessibility cost, so decide whether it suits your app.

## Touch gestures

On mobile the calendar responds to three gestures:

| Gesture | Where | What it does |
| --- | --- | --- |
| [Swipe](#swipe-to-navigate) left or right | Month, week and day views | Goes to the next or previous month, week or day |
| [Pinch](#pinch-to-zoom) | Week and day views | Zooms the time grid in or out |
| [Swipe left](#closing-the-side-menu) | Side menu | Closes the menu |

All gestures are for the mobile layout, meaning windows narrower than 768px. They are handled with [Hammer.js](https://hammerjs.github.io/), which the calendar loads for you, in the browser only. Your app does not need to load or configure it, and the package can still be imported in server-side rendering.

```js
const calendarApp = createCalendar({
  views: [createViewDay(), createViewWeek(), createViewMonth()],
  enableSwipeGestures: true,   // default
  enablePinchToZoom: true      // default
});
```

### Swipe to navigate

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

#### Without swipe

On a phone, swiping is how users move between periods, so the mobile header has no previous and next buttons. When you set `enableSwipeGestures: false`, the header shows previous and next buttons instead, next to **Today**.

#### Reduced motion

When the device is set to reduce motion (`prefers-reduced-motion`), a swipe still follows your finger, but the page changes straight away instead of sliding.

### Pinch to zoom

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

### Closing the side menu

With the side menu open, swipe it to the left. The menu follows your finger and closes when you drag it more than about 130px, or flick it quickly. Otherwise it springs back. On phones that support it, a short vibration confirms the close.

The menu cannot be opened by swiping. Use the menu button in the header.

### In single-page apps

The calendar sets its gestures up when it appears and removes them when it leaves, so moving between routes leaves no stale handlers behind. No extra work is needed.

## Trying it on a computer

- **Browser device mode.** In Chrome or Edge, open DevTools (F12) and turn on the device toolbar (Ctrl+Shift+M). It sends touch events, so swipe, the side menu and pinch all work; hold Shift and drag to pinch.
- **A narrow window.** The layout switches at 768px, and dragging sideways with the mouse swipes between periods. Pinch needs touch, so use device mode or a real phone.
- **Playwright.** The project's own tests use the `Pixel 5` device; see `tests/mobile/`.

If a gesture does nothing, see [Troubleshooting](./TROUBLESHOOTING.md#touch-gestures-do-nothing).
