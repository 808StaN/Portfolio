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
