// Puts the whole app in fullscreen when the visitor taps "Tap to enter". Browsers only allow
// this from inside a click, tap or key handler. Where it isn't supported (iPhone Safari only
// allows fullscreen for video) or is refused, the app simply carries on in the window.
// The visitor can leave fullscreen with Esc or the browser's own controls.
export function enterFullscreen() {
  const root = document.documentElement
  if (document.fullscreenElement || document.webkitFullscreenElement) return
  try {
    const request = root.requestFullscreen?.bind(root) ?? root.webkitRequestFullscreen?.bind(root)
    const result = request?.({ navigationUI: 'hide' })
    if (result?.catch) result.catch(() => {})
  } catch {
    // not allowed here; stay in the window
  }
}
