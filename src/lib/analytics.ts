declare global {
  interface Window {
    va?: (...args: unknown[]) => void
    vaq?: IArguments[]
  }
}

/**
 * Vercel Web Analytics, loaded only in production builds made on Vercel.
 * Self-hosted builds (Docker, `npm run dev`) skip it entirely, so there is no
 * extra request and nothing to 404.
 */
export function initAnalytics() {
  if (!__ON_VERCEL__ || !import.meta.env.PROD) return
  window.va =
    window.va ||
    function () {
      // eslint-disable-next-line prefer-rest-params
      ;(window.vaq = window.vaq || []).push(arguments)
    }
  const script = document.createElement('script')
  script.defer = true
  script.src = '/_vercel/insights/script.js'
  document.head.append(script)
}
