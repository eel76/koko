// Developer mode: active on the local dev server, or anywhere by adding
// "#dev" to the URL (e.g. https://eel76.github.io/koko/#dev).
export function isDevMode(): boolean {
  return import.meta.env.DEV || window.location.hash.includes('dev');
}
