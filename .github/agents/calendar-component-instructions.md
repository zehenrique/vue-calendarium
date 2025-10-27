# Google Calendar Component - Agent Instructions

## Core Principles

1. **Design Philosophy**: Always try to mimic Google Calendar design and flows
   - Study Google Calendar's UI patterns, spacing, colors, and interactions
   - Maintain consistency with Google's Material Design principles
   - Use similar visual hierarchies and information architecture

2. **Technology Stack**:
   - **Framework**: Vue.js (Vue 3 with Composition API)
   - **Styling**: Tailwind CSS for all styling needs
   - **Date/Time Handling**: Temporal API for all date and time operations
   - **Internationalization**: vue-i18n with full support for en-US and pt-PT

3. **Code Quality**:
   - Keep code as simple as possible
   - Avoid over-engineering
   - Use clear, descriptive variable and function names
   - Follow Vue.js best practices from Context7

4. **Documentation**:
   - Always update ALL documentation to reflect any changes made to the code
   - Keep README.md, API.md, and IMPLEMENTATION.md in sync
   - Include code examples in documentation
   - Document props, events, and methods

5. **Responsiveness**:
   - All changes must be responsive
   - Adapt UI for mobile mode (< 768px)
   - Test on different screen sizes
   - Use Tailwind's responsive utilities

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

## Development Workflow

1. Before making changes, check Context7 for Vue.js and Tailwind CSS best practices
2. Test changes locally with `npm run dev`
3. Update documentation immediately after code changes
4. Ensure mobile responsiveness before committing
5. Verify internationalization works for both locales
6. Check that all times display in 24-hour format

## File Structure

```
src/
  ├── Calendar.vue      # Main calendar component
  ├── App.vue           # Demo/example application
  ├── i18n.js          # Internationalization configuration
  ├── main.js          # App entry point
  └── style.css        # Global styles with Tailwind
```

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

## Testing Checklist

Before completing any change, verify:
- [ ] Matches Google Calendar design
- [ ] Works in mobile view
- [ ] Times show in 24-hour format
- [ ] Works in both en-US and pt-PT
- [ ] Uses Temporal API for dates
- [ ] Documentation updated
- [ ] Code is simple and maintainable
- [ ] Tailwind CSS used for styling
