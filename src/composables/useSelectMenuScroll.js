const MAX_ALIGN_FRAMES = 10;

/**
 * Scrolls the selected option of an open VSelect menu to the top of the list.
 *
 * Vuetify 4 centres the selected option when a select menu opens; Vuetify 3
 * showed it at the top of the list. Use on selects with `no-auto-scroll` and a
 * `calendar-select-menu` content class:
 *
 *   <v-select no-auto-scroll :menu-props="{ contentClass: 'calendar-select-menu' }"
 *     @update:menu="open => scrollSelectedOptionToTop(open, items, value)">
 *
 * @param {boolean} isOpen - Menu state emitted by `update:menu`
 * @param {Array<{ value: unknown }>} items - The select items
 * @param {unknown} value - The selected value
 */
export function scrollSelectedOptionToTop(isOpen, items, value) {
  if (!isOpen || typeof window === 'undefined') return;

  const index = items.findIndex(item => item.value === value);
  if (index < 0) return;

  let frames = 0;
  const align = () => {
    // Only the menu being opened is displayed; closed menus are hidden or unmounted
    const list = [...document.querySelectorAll('.calendar-select-menu .v-list')]
      .filter(el => el.offsetParent !== null)
      .pop();
    const selected = list?.querySelector('.v-list-item--active');
    let aligned = false;

    if (selected) {
      // The list is virtualised, so align on the rendered option until it settles.
      // Layout offsets are used because the menu may still be in its scale transition.
      const paddingTop = parseFloat(getComputedStyle(list).paddingTop);
      const target = selected.offsetParent === list
        ? selected.offsetTop - paddingTop
        : list.scrollTop + selected.getBoundingClientRect().top - list.getBoundingClientRect().top - paddingTop;
      aligned = Math.abs(list.scrollTop - target) < 1;
      list.scrollTop = target;
    } else if (list) {
      const option = list.querySelector('.v-list-item');
      if (option) list.scrollTop = index * option.offsetHeight;
    }

    frames += 1;
    if (!aligned && frames < MAX_ALIGN_FRAMES) window.requestAnimationFrame(align);
  };

  window.requestAnimationFrame(align);
}
