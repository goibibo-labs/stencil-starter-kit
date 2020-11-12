export function getter(key) {
  if (!window.localStorage) return;
  try {
  } catch (err) {
    console.error(err); // ! should use logger
  }
  return JSON.parse(localStorage.getItem(key));
}

export function setter(key, data) {
  if (!window.localStorage) return;
  localStorage.setItem(key, JSON.stringify(data));
}
