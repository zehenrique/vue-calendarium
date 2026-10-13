# Mobile layout

The calendar has a layout for narrow screens. It switches on its own, with nothing to configure, and it works together with the [touch gestures](./GESTURES.md).

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

The create, details, delete and repeat dialogs open as **bottom sheets** that slide up from the bottom, instead of centred dialogs.

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

## Testing it

- **Browser DevTools.** Use the device toolbar. It sends touch events, so swipe, pinch and the side menu all work.
- **A narrow window.** The layout switches at 768px, and dragging with the mouse swipes between periods. Pinch needs a touch screen or DevTools device emulation.
- **Playwright.** The project's own tests use the `Pixel 5` device. See `tests/mobile/`.
