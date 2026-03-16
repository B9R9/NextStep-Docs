import { watchEffect, onUnmounted } from 'vue'

export function useScrollLock(isOpen: () => boolean) {
  watchEffect(() => {
    document.body.style.overflow = isOpen() ? 'hidden' : ''
  })

  onUnmounted(() => {
    document.body.style.overflow = ''
  })
}
