import Clarity from '@microsoft/clarity'

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const id = String(useRuntimeConfig().public.clarityId)
  if (!process.client || process.dev || !id || id === 'undefined') return
  Clarity.init(id)
  nuxtApp.hook('page:finish', () => window.clarity?.('track', 'pageview'))
})