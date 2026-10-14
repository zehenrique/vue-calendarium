# Contributing to vue-calendarium

Thanks for your interest in contributing! This document explains how to get set up and what we expect from contributions.

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold it. Please report unacceptable behavior to the address listed there.

## Getting started

```bash
git clone https://github.com/zehenrique/vue-calendarium.git
cd vue-calendarium
npm install
make dev      # or: npm run dev
```

The app runs on <http://localhost:3000>.

## Tech stack & conventions

- **Vue 3** with the Composition API (`<script setup>`). Avoid the Options API.
- **Vuetify 4** for components and Material Design styling; see [Styling choices](#styling-choices) below.
- **Temporal API** for all date/time work — do not use the legacy `Date` object.
- **vue-i18n** for all user-facing strings (`en` and `pt`). Never hard-code copy.
- Times are always displayed in **24-hour** format.
- Keep components small and focused; prefer composables for shared logic.

See [AGENTS.md](./AGENTS.md) for the full set of project conventions.

### Styling choices

The calendar follows Vuetify 4's Material Design 3 styling, with these calendar-specific choices. Keep them when changing components:

- **Header title.** The month title in the header is sized by `--calendar-font-size-title` (20px by default) on desktop and mobile, instead of a Vuetify typography class.
- **Dialog corners.** Dialogs use `rounded="xl"` and bottom sheets `rounded="t-xl"` (24px).
- **Dialog buttons.** As in Google Calendar, a dialog's buttons sit together on the right (**Cancel** next to **Save**) and have the same height and padding, so a text button's hover background is as large as the filled button.
- **Buttons.** As in Google Calendar, buttons are pill-shaped and icon buttons round, including the hover background. The calendar sets this with a `v-defaults-provider` ([`src/config/vuetifyDefaults.js`](./src/config/vuetifyDefaults.js)), so it does not depend on your app's `VBtn` defaults. The header's **Today** button keeps its 12px corners, to match the view selector and date field next to it.
- **Typography.** Text uses Vuetify 4's Material Design 3 classes (`text-headline-small`, `text-title-large`, `text-body-large`, `text-body-medium`, `text-body-small`), following Vuetify's [typography migration](https://vuetifyjs.com/en/getting-started/upgrade-guide/#typography).
- **Icon and text rows.** In the event details, each icon (or colour dot) sits in a box one text line tall (`height: 1lh`), so it stays centred on the first line of its text at any font size.
- **Date picker in the event dialog.** The day rows are 40px tall without Vuetify's extra row padding, so the picker opens below the event title. All date pickers use `control-variant="modal"` (month and year button plus previous/next arrows).
- **Time dropdowns.** Vuetify 4 centres the selected option when a select menu opens. The time selects use `no-auto-scroll` and [`scrollSelectedOptionToTop`](./src/composables/useSelectMenuScroll.js) to show it at the top of the list.
- **Header controls.** The desktop header's **Today** button, view selector and date field share one outlined style, built from existing theme variables (`--calendar-border-color`, `--calendar-text-primary`, `--calendar-font-size-base`, `--calendar-font-weight-normal`, `--calendar-border-radius-lg`, `--calendar-day-hover-bg`), so no component-specific overrides are needed.

What app developers need to know about Vuetify 4 (load order, CSS layers) is in [Theming](./docs/THEMING.md#vuetify-4).

## Tests

```bash
make test         # unit tests (Vitest)
make test-ui      # end-to-end / UI tests (Playwright)
```

The UI tests start the dev server on port 3000, or reuse a server already running there. If another app is using that port, pick a free one: `TEST_PORT=3100 make test-ui`.

All tests must pass before a PR is merged. Add or update tests for any behavior you change, and run the Playwright suite for UI changes.

## Pull requests

1. Fork the repo and create a branch off `main`.
2. Make your change, keeping commits focused.
3. Update documentation (`README.md`, `docs/`) and the [CHANGELOG](./CHANGELOG.md) when relevant. The documentation website is built from these files, so it updates on its own.
4. Ensure `make lint`, `make test`, and the UI tests pass.
5. Open a PR describing **what** changed and **why**.

## Reporting bugs / requesting features

Please use the GitHub issue templates. Include reproduction steps, expected vs. actual behavior, and your environment (browser, OS, Vue/Vuetify versions).
