# Troubleshooting

## My events do not show up

**They were rejected.** Every event needs a `calendarId` that matches a calendar you created. Events without one are not added, and the browser console shows an error such as `Event "Lunch" (12) was rejected: it has no calendarId`. Create the calendars first, and give every event its `calendarId`.

**Their calendar is hidden.** Events of a calendar with `visible: false`, or one hidden with `calendarsService.toggleVisibility()` or the mobile side menu, are not drawn.

**The event is on another date.** Check `start`, and that you are looking at the right month or week with `calendarApp.setDate()`.

**The time looks shifted.** Event dates are wall-clock times such as `'2026-03-02T10:00:00'`, shown as they are. A value with `Z` or an offset, such as `'2026-03-02T10:00:00Z'`, is an exact moment and is converted to the viewer's time zone, so in New York it shows at 05:00. If your server stores wall-clock times with a `Z` by mistake, remove it before passing the event in.

## The calendar is empty or has no height

The calendar fills its parent (`height: 100%`). If the parent has no height, the calendar collapses to nothing. Give it one:

```vue
<div style="height: 100vh">
  <Calendar :calendar-app="calendarApp" />
</div>
```

In a flex layout, give the parent `min-height: 0` as well, so it can shrink and the time grid can scroll inside it.

## Nothing is styled, or Vuetify components are missing

- Wrap the page in `<v-app>`. The calendar needs Vuetify's layout and theme.
- Install Vuetify and import its styles in your app (`import 'vuetify/styles'`).
- Install vue-i18n in the Composition API mode and register the calendar's messages. See [Languages](./I18N.md#set-it-up).
- Import the Material Design Icons font, or the icons are missing: `import '@mdi/font/css/materialdesignicons.css'`.

## Dialogs and buttons have no spacing

Your app probably has a global CSS reset that is not in a cascade layer, which Vuetify 4 cannot override. See [Upgrading](./UPGRADING.md#5-move-global-css-resets-into-a-layer).

## The language does not change

- Use `calendarApp.setLocale('pt-PT')`. Changing only your app's vue-i18n locale has no effect on the calendar.
- Register `translations.en` and `translations.pt` under the keys `en` and `pt`, and create vue-i18n with `legacy: false`.
- Only `en-US` and `pt-PT` are supported.

See [Languages](./I18N.md).

## Touch gestures do nothing

- **The window is 768px or wider.** Gestures only work in the [mobile layout](./MOBILE.md). Narrow the window or use a phone.
- **A dialog or the side menu is open.** Swiping is paused while they are open.
- **Swipe or pinch is turned off.** Check `enableSwipeGestures` and `enablePinchToZoom`.
- **You are in the month view.** Pinch only works in the week and day views.
- **You are testing pinch on a computer.** It needs two touch points. Use DevTools device emulation or a real device.
- **Hammer.js did not load.** The calendar loads it on demand and logs "Failed to load hammerjs; touch gestures are disabled" if that fails. Check that your bundler can resolve the `hammerjs` package, which comes with the calendar.

See [Touch gestures](./MOBILE.md#touch-gestures).

## The zoom level is stuck

The pinch zoom is saved in the browser. Clear the site's `localStorage` entries that start with `calendar-zoom-`, or clear the site data.

## Dialogs appear as bottom sheets on my laptop

The dialogs follow Vuetify's `mobile` flag, which is based on a Vuetify breakpoint, not on the 768px used by the calendar's layout. See [Dialogs and bottom sheets](./MOBILE.md#dialogs-and-bottom-sheets).

## Editing one repeating event changed all of them

After saving, the calendar asks which events the change applies to. Choose **This event** to change only that occurrence. The option is not offered when you also changed the repeat rule, because a single event cannot repeat on its own. See [Recurring events](./RECURRING_EVENTS.md#changing-one-occurrence-or-many).

## An event keeps repeating

Open the event, choose **Edit**, click the repeat link next to **All day** and choose **Does not repeat**. For an occurrence of a series, saving then asks **This and following events** (the series stops before this occurrence) or **All events** (the series becomes a single event on its first date). See [Recurring events](./RECURRING_EVENTS.md#the-repeat-menu).

## Server-side rendering

The package can be imported on the server, because Hammer.js is only loaded in the browser. Rendering the calendar itself on the server has not been tested. In Nuxt or similar, render it on the client only, for example inside `<ClientOnly>`.

## Still stuck?

Search the [issues](https://github.com/zehenrique/vue-calendarium/issues), or open a new one with the versions of Vue, Vuetify and vue-i18n you use and a small example.
