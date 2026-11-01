export const getScrollViewport = () =>
  document.getElementById('portfolio-scrollport');

export const getScrollMetrics = () => {
  const viewport = getScrollViewport();
  if (viewport) {
    const rect = viewport.getBoundingClientRect();
    return {
      scroll: viewport.scrollTop,
      limit: Math.max(0, viewport.scrollHeight - viewport.clientHeight),
      width: viewport.clientWidth,
      height: viewport.clientHeight,
      top: rect.top,
      left: rect.left,
    };
  }

  return {
    scroll: window.scrollY,
    limit: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
    top: 0,
    left: 0,
  };
};

export const getScrollTargetTop = (element: HTMLElement) => {
  const { scroll, top } = getScrollMetrics();
  return scroll + element.getBoundingClientRect().top - top;
};

export const getKeyboardScrollDelta = (event: KeyboardEvent): number | null => {
  const viewport = getScrollViewport();
  if (!viewport || event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey
    || (event.shiftKey && event.key !== ' ')
    || document.documentElement.hasAttribute('data-page-loading')
    || document.querySelector('.mobile-menu-backdrop')) return null;

  const target = event.target instanceof Element ? event.target : null;
  if ((target instanceof HTMLElement && target.isContentEditable)
    || target?.closest('input, textarea, select, summary, video, audio, [role="textbox"], [role="combobox"], [role="listbox"], [role="slider"], [role="spinbutton"], [role="checkbox"], [role="radio"], [role="switch"], [role="menu"], [role="tree"], [role="grid"], [role="tablist"], [data-lenis-prevent], [data-lenis-prevent-vertical]')
    || (event.key === ' ' && target?.closest('button, [role="button"]'))) return null;

  const { height, limit } = getScrollMetrics();
  let delta: number;
  switch (event.key) {
    case 'ArrowUp': delta = -80; break;
    case 'ArrowDown': delta = 80; break;
    case 'PageUp': delta = -height * 0.85; break;
    case 'PageDown': delta = height * 0.85; break;
    case 'Home': delta = -limit; break;
    case 'End': delta = limit; break;
    case ' ': delta = height * 0.85 * (event.shiftKey ? -1 : 1); break;
    default: return null;
  }

  // Leave keyboard scrolling inside nested scroll containers to the browser.
  for (let node = target; node && node !== viewport; node = node.parentElement) {
    if (node.scrollHeight > node.clientHeight + 1 && /^(auto|scroll|overlay)$/.test(getComputedStyle(node).overflowY)) return null;
  }
  return delta;
};
