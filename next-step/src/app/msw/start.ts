export async function startMSW() {
  if (!import.meta.env.DEV) return
  if (import.meta.env.VITE_API_MOCK !== 'true') {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations
          .filter((registration) =>
            registration.active?.scriptURL.includes('mockServiceWorker.js')
          )
          .map((registration) => registration.unregister())
      )
    }
    return
  }

  const { worker } = await import('./browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}
