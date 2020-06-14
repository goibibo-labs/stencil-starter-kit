export function getIntersectionObserverInstance() {
  if (typeof window === 'undefined') {
    return;
  }

  return window.IntersectionObserver;
}
