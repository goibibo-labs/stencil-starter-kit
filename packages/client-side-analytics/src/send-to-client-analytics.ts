export default function sendToClientAnalytics(data) {
  const searchParams = new URLSearchParams();
  Object.keys(data).map(dataKey => {
    searchParams.set(dataKey, data[dataKey]);
  });

  const url = `https://clientIngestionApi.domain.com/somePath/?${searchParams.toString()}`;

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  (navigator.sendBeacon && navigator.sendBeacon(url)) || fetch(url);
}
