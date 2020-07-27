export default function getIntersectionObserverInstance() {
  if (typeof window === 'undefined') {
    return;
  }

  return window.IntersectionObserver;
}
