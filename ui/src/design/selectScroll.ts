// A closed <select> answers the mouse wheel, stepping through its options and
// firing change without opening; browsers only do that for an open one.

/** Attaches the behaviour to one <select>; a second call does nothing. */
export function enableSelectScroll(select: HTMLSelectElement): void {
  if (select.dataset['glimScroll'] === '1') return;
  select.dataset['glimScroll'] = '1';

  select.addEventListener(
    'wheel',
    (event) => {
      if (select.disabled || select.options.length < 2) return;
      // The wheel changes the value instead of scrolling the page.
      event.preventDefault();

      const delta = event.deltaY > 0 ? 1 : -1;
      const next = Math.min(select.options.length - 1, Math.max(0, select.selectedIndex + delta));
      if (next === select.selectedIndex) return;

      select.selectedIndex = next;
      // A real change event, so every change listener picks it up.
      select.dispatchEvent(new Event('change', { bubbles: true }));
    },
    { passive: false },
  );
}

/** Attaches the behaviour to every <select> under root. */
export function enableSelectScrollForAll(root: ParentNode = document): void {
  for (const select of root.querySelectorAll('select')) {
    enableSelectScroll(select as HTMLSelectElement);
  }
}
