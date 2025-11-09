let systemMedia: MediaQueryList | null = null
let systemListener: ((e: MediaQueryListEvent) => void) | null = null

function applyDarkClass(on: boolean): void {
  const root = document.documentElement
  root.classList.toggle('dark', on)
}

export function applyTheme(mode: Settings.ThemeMode): void {
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

// Normalize theme value to a valid ThemeMode
export function normalizeThemeMode(value: unknown): Settings.ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
    ? (value as Settings.ThemeMode)
    : 'system'
}

// Normalize font scale to a positive number with default 1.0
export function normalizeFontScale(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return n > 0 ? n : 1.0
}

// Apply font scale to the document root
export function applyFontScale(scale: number): void {
  const s = normalizeFontScale(scale)
  const percent = Math.round(s * 100)
  document.documentElement.style.fontSize = `${percent}%`
}

// Apply default UI settings synchronously to avoid initial flash
export function applyDefaults(): void {
  try {
    applyTheme('system')
    applyFontScale(1.0)
  } catch {
    // ignore
  }
}

// Normalize combined settings object
export function normalizeSettings(input: Partial<{ themeMode: unknown; fontScale: unknown }>): {
  themeMode: Settings.ThemeMode
  fontScale: number
} {
  return {
    themeMode: normalizeThemeMode(input?.themeMode),
    fontScale: normalizeFontScale(input?.fontScale)
  }
}
