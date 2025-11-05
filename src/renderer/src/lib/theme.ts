export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'overlook-theme'
let systemMedia: MediaQueryList | null = null
let systemListener: ((e: MediaQueryListEvent) => void) | null = null

function applyDarkClass(on: boolean): void {
  const root = document.documentElement
  root.classList.toggle('dark', on)
}

export function getStoredTheme(): ThemeMode {
  const t = localStorage.getItem(STORAGE_KEY)
  if (t === 'light' || t === 'dark' || t === 'system') return t
  return 'system'
}

export function applyTheme(mode: ThemeMode): void {
  if (systemListener && systemMedia) {
    systemMedia.removeEventListener('change', systemListener)
    systemListener = null
  }
  if (mode === 'system') {
    systemMedia = window.matchMedia('(prefers-color-scheme: dark)')
    applyDarkClass(systemMedia.matches)
    systemListener = (e: MediaQueryListEvent) => applyDarkClass(e.matches)
    systemMedia.addEventListener('change', systemListener)
  } else {
    applyDarkClass(mode === 'dark')
  }
}

export function setTheme(mode: ThemeMode): void {
  localStorage.setItem(STORAGE_KEY, mode)
  applyTheme(mode)
}

export function initTheme(): void {
  applyTheme(getStoredTheme())
}