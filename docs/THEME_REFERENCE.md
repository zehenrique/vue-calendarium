# Theme variables

The CSS variables of the default theme, with their values. Set any of them through the `theme` prop or in your CSS; see [Theming](./THEMING.md) for how. The defaults come from [`src/config/theme.js`](../src/config/theme.js).

## Background Colors

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-bg` | `#ffffff` | Main calendar background |
| `--calendar-header-bg` | `#f8f9fa` | Header section background |
| `--calendar-day-bg` | `#ffffff` | Day cell background |
| `--calendar-day-other-month-bg` | `#fafafa` | Other month days background |
| `--calendar-day-hover-bg` | `#f8f9fa` | Hover state background |

## Border Colors

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-border-color` | `#e0e0e0` | Primary border color |
| `--calendar-border-color-dark` | `#d0d0d0` | Darker border color |

## Text Colors

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-text-primary` | `#3c4043` | Primary text color |
| `--calendar-text-secondary` | `#70757a` | Secondary text color |
| `--calendar-text-disabled` | `#5f6368` | Disabled text color |

## Accent Colors

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-primary-color` | `#1a73e8` | Primary accent color |
| `--calendar-primary-hover` | `#1557b0` | Primary hover color |
| `--calendar-today-bg` | `#1a73e8` | Today indicator background |
| `--calendar-today-color` | `#ffffff` | Today indicator text |
| `--calendar-current-time-color` | `#ea4335` | Current time line color |

## Event Colors

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-event-bg` | `#1967d2` | Default event background |
| `--calendar-event-color` | `#ffffff` | Default event text |
| `--calendar-event-hover-opacity` | `0.8` | Event hover opacity |
| `--calendar-ghost-event-opacity` | `0.5` | Ghost event opacity |

## Typography

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-font-family` | `'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif` | Font family |
| `--calendar-font-size-base` | `14px` | Base font size |
| `--calendar-font-size-small` | `12px` | Small font size |
| `--calendar-font-size-xsmall` | `11px` | Extra small font size |
| `--calendar-font-size-large` | `16px` | Large font size |
| `--calendar-font-size-title` | `1.25rem` | Title font size |
| `--calendar-font-weight-normal` | `400` | Normal font weight |
| `--calendar-font-weight-medium` | `500` | Medium font weight |

## Spacing

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-spacing-xs` | `2px` | Extra small spacing |
| `--calendar-spacing-sm` | `4px` | Small spacing |
| `--calendar-spacing-md` | `8px` | Medium spacing |
| `--calendar-spacing-lg` | `12px` | Large spacing |
| `--calendar-spacing-xl` | `16px` | Extra large spacing |
| `--calendar-spacing-xxl` | `20px` | 2X large spacing |

## Header Sizing

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-header-padding` | `16px 20px` | Header padding |
| `--calendar-header-gap` | `12px` | Header element gap |
| `--calendar-header-border-width` | `1px` | Header border width |

## Time Column

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-time-column-width` | `60px` | Time column width (desktop) |
| `--calendar-time-column-width-mobile` | `50px` | Time column width (mobile) |

## Day Numbers

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-day-number-size` | `24px` | Day number circle size |
| `--calendar-day-number-font-size` | `12px` | Day number font size |
| `--calendar-week-day-number-size` | `36px` | Week view day number size |
| `--calendar-week-day-number-size-mobile` | `32px` | Mobile week day number size |
| `--calendar-week-day-font-size` | `11px` | Week day label font size |
| `--calendar-week-day-font-size-mobile` | `10px` | Mobile week day font size |

## Hour Slots (Grid Height)

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-pixels-per-hour-week` | `60px` | Week view hour height |
| `--calendar-pixels-per-hour-week-mobile` | `50px` | Week view hour height (mobile) |
| `--calendar-pixels-per-hour-day` | `45px` | Day view hour height |
| `--calendar-pixels-per-hour-day-mobile` | `38px` | Day view hour height (mobile) |

## Event Elements

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-event-padding` | `2px 6px` | Event padding |
| `--calendar-event-border-radius` | `6px` | Event border radius |
| `--calendar-event-font-size` | `11px` | Event font size |
| `--calendar-event-font-size-mobile` | `10px` | Event font size (mobile) |
| `--calendar-event-line-height` | `1.2` | Event line height |
| `--calendar-event-max-height` | `20px` | Event max height |
| `--calendar-event-gap` | `2px` | Gap between events |

## All-Day Events

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-all-day-min-height` | `20px` | All-day section min height |
| `--calendar-all-day-padding` | `4px` | All-day section padding |
| `--calendar-all-day-event-padding` | `2px 8px` | All-day event padding |
| `--calendar-all-day-event-padding-mobile` | `2px 1px` | Mobile all-day event padding |
| `--calendar-all-day-event-font-size` | `12px` | All-day event font size |
| `--calendar-all-day-event-font-size-mobile` | `8.5px` | Mobile all-day font size |
| `--calendar-all-day-event-border-radius` | `8px` | All-day event border radius |
| `--calendar-all-day-event-border-radius-mobile` | `5px` | Mobile border radius |

## Grid

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-grid-gap` | `1px` | Gap between grid cells |

## Borders & Radius

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-border-radius` | `4px` | Base border radius |
| `--calendar-border-radius-sm` | `6px` | Small border radius |
| `--calendar-border-radius-md` | `8px` | Medium border radius |
| `--calendar-border-radius-lg` | `12px` | Large border radius |
| `--calendar-border-radius-circle` | `50%` | Circle border radius |

## Transitions

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-transition-fast` | `0.2s` | Fast transition |
| `--calendar-transition-medium` | `0.3s` | Medium transition |

## Z-Index (Layering)

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-header-z-index` | `10` | Header z-index |
| `--calendar-event-z-index` | `1` | Event z-index |
| `--calendar-current-time-z-index` | `5` | Current time indicator z-index |

## Current Time Indicator

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-current-time-circle-size` | `12px` | Circle size |

## Mobile Specific

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-mobile-breakpoint` | `768px` | Mobile breakpoint |
| `--calendar-mobile-header-padding` | `2px 2px` | Mobile header padding |
| `--calendar-mobile-header-gap` | `8px` | Mobile header gap |
| `--calendar-mobile-day-number-font-size` | `11px` | Mobile day number size |
| `--calendar-mobile-event-font-size` | `10px` | Mobile event font size |

## Day View Specific

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-day-view-weekday-font-size` | `11px` | Day view weekday label |
| `--calendar-day-view-number-font-size` | `26px` | Day view number size |
| `--calendar-day-view-number-margin-top` | `2px` | Day number top margin |

## Sidebar

| Variable | Default | Description |
| --- | --- | --- |
| `--calendar-sidebar-width` | `256px` | Width of the desktop sidebar |
