# Google Calendar Component - Agent Instructions

## Core Principles

1. **Design Philosophy**: Always try to mimic Google Calendar design and flows
   - Study Google Calendar's UI patterns, spacing, colors, and interactions
   - Maintain consistency with Google's Material Design principles
   - Use similar visual hierarchies and information architecture

2. **Technology Stack**:
   - **Framework**: Vue.js (Vue 3 with Composition API)
      - Composition API only: Use the Composition API and avoid the Options API for all new/updated components.
   - **Styling**: Vuetify (Material Design for Vue.js)
      - Use Vuetify components and Material Design principles
      - Leverage Vuetify's built-in responsive utilities
      - Use Material Design Icons (@mdi/font)
   - **Date/Time Handling**: Temporal API for all date and time operations
   - **Internationalization**: vue-i18n with full support for en-US and pt-PT

3. **Code Quality**:
   - Keep code as simple as possible
   - Avoid over-engineering
   - Use clear, descriptive variable and function names
   - Follow code best practices from Context7
   - Component decomposition: Always break big component files into smaller, focused components when possible.
     - Split large files into smaller components for better maintainability
     - Create separate helper files for utility functions
     - Create separate files for styling/theme configuration if needed
     - For example, break complex views into sub-components and composables
     - Keep component files under 300 lines when possible
   - **HTML/Template Formatting**:
     - Component opening tags must be on a single line with all props/attributes
     - Never split component props across multiple lines
     - Example: `<v-btn icon variant="text" size="small" @click="handler" :aria-label="label">` ✅
     - NOT: `<v-btn\n  icon\n  variant="text">` ❌
     - Exception: Template slots and children can span multiple lines

4. **Documentation**:
   - Always update ALL documentation to reflect any changes made to the code
   - Keep README.md, API.md, and IMPLEMENTATION.md in sync
   - Include code examples in documentation
   - Document props, events, and methods

5. **Responsiveness**:
   - All changes must be responsive
   - Adapt UI for mobile mode (< 768px)
   - Test on different screen sizes
   - Use Vuetify's responsive utilities (breakpoints, display helpers)
   - Use useDisplay composable for programmatic breakpoint detection

6. **Time Format**:
   - Always use 24-hour format for time display (HH:MM)
   - Never use 12-hour format (AM/PM)
   - Apply consistently across all views and modals

7. **Internationalization**:
   - Implement full internationalization for en-US and pt-PT
   - Use i18n keys for all user-facing text
   - Support locale-aware date/time formatting
   - Make language configurable via props

8. **Date Handling**:
   - Use Temporal API exclusively for all date/time operations
   - No Date() object usage
   - Leverage Temporal.PlainDate, Temporal.PlainDateTime, Temporal.Now
   - Handle time zones appropriately
   - Follow the iCalendar (RFC 5545) standard for calendar data and interoperability. Calendar data exchanged or persisted (for import/export) should conform to iCalendar where applicable.
   - Use the RRULE recurrence standard from iCalendar (RFC 5545) for defining recurring events; parse and serialize RRULE strings for recurrence handling.

## Development Workflow

1. Before making changes, check Context7 for Vue.js and Vuetify best practices
2. Use Makefile targets for common workflows (preferred):
   - Start dev server: `make dev` (runs `npm run dev`)
   - Run unit tests: `make test`
   - Run Playwright UI tests: `make test-ui` (runs `npm run test:ui`)
   - Build production: `make build`
   - Lint/format: `make lint` / `make format`
   Prefer `make <target>` over calling `npm` scripts directly to keep workflows consistent.
3. Always run Playwright UI tests for UI changes. Use `make test-ui` as part of your change verification and CI. Failures in Playwright tests must be addressed before merging UI changes.
4. Update documentation immediately after code changes
4. Ensure mobile responsiveness before committing
5. Verify internationalization works for both locales
6. Check that all times display in 24-hour format

## Key Features to Maintain

- Month/Week/Day views
- Event creation via UI (click time slots)
- Event detail modal (view/edit/delete)
- Recurring events (daily, weekly, monthly, yearly)
- Multiple calendar categories
- Custom hex colors for events
- Accessibility (ARIA labels, keyboard navigation)
- Current time indicator
- Event overlap handling
- Mobile swipe gestures
- Mobile sidebar navigation
- Sticky calendar header 

## Testing Checklist

Before completing any change, verify:
- [ ] Matches Google Calendar design (using Material Design)
- [ ] Works in mobile view
- [ ] Times show in 24-hour format
- [ ] Works in both en-US and pt-PT
- [ ] Uses Temporal API for dates
- [ ] Documentation updated
- [ ] Code is simple and maintainable
- [ ] Vuetify components used for styling
- [ ] Horizontal swipe gestures work in mobile mode
- [ ] 100% of tests pass