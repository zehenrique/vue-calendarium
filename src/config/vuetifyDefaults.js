// Vuetify defaults for the components inside the calendar, its dialogs included.
// Buttons are pill-shaped and icon buttons round, as in Google Calendar, whatever
// defaults the app sets for its own buttons.
const BUTTON = { rounded: 'pill' };

// Each dialog (and bottom sheet) starts again from the app's defaults plus its `VDialog`
// defaults, so these are repeated for dialogs opened from dialogs, such as the custom
// repeat dialog opened from the event dialog
const DIALOG_DEPTH = 3;
function dialogDefaults(depth) {
  return depth === 0 ? { VBtn: BUTTON } : { VBtn: BUTTON, VDialog: dialogDefaults(depth - 1) };
}

export const CALENDAR_DEFAULTS = {
  VBtn: BUTTON,
  VDialog: dialogDefaults(DIALOG_DEPTH)
};
