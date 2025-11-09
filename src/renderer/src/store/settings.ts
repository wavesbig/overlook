import { create } from 'zustand'
import {
  applyTheme,
  applyFontScale,
  normalizeSettings,
  applyDefaults
} from '@renderer/lib/settings'

type SettingsState = {
  themeMode: Settings.ThemeMode
  fontScale: number
  setThemeMode: (m: Settings.ThemeMode) => void
  setFontScale: (v: number) => void
}

const repository = {
  async hydrate(): Promise<{ themeMode: Settings.ThemeMode; fontScale: number } | null> {
    try {
      if (window.api?.storeGet) {
        const settings = await window.api.storeGet('settings')
        const normalized = normalizeSettings({
          themeMode: settings?.themeMode,
          fontScale: settings?.fontScale
        })
        return normalized
      }
    } catch {
      // ignore
    }
    return null
  },
  async persist(themeMode: Settings.ThemeMode, fontScale: number): Promise<void> {
    try {
      if (window.api?.storeSet) {
        await window.api.storeSet('settings', { themeMode, fontScale })
      }
    } catch {
      // ignore
    }
  }
}

let saveTimer: number | undefined
function debounceSave(themeMode: Settings.ThemeMode, fontScale: number): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    void repository.persist(themeMode, fontScale)
  }, 300)
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  themeMode: 'system',
  fontScale: 1.0,
  setThemeMode(m) {
    const { fontScale } = get()
    set({ themeMode: m })
    // Apply theme immediately
    try {
      applyTheme(m)
    } catch {
      // ignore
    }
    debounceSave(m, fontScale)
  },
  setFontScale(v) {
    const { themeMode } = get()
    set({ fontScale: v })
    // Apply font scale immediately
    try {
      applyFontScale(v)
    } catch {
      // ignore
    }
    debounceSave(themeMode, v)
  }
}))

// Apply sensible defaults synchronously to avoid flash before hydration
try {
  applyDefaults()
} catch {
  // ignore
}

// Hydrate from main electron-store asynchronously if available
void (async function hydrate(): Promise<void> {
  const data = await repository.hydrate()
  if (data) {
    useSettingsStore.setState({ themeMode: data.themeMode, fontScale: data.fontScale })
    // Apply loaded preferences globally
    try {
      applyTheme(data.themeMode)
      applyFontScale(data.fontScale)
    } catch {
      // ignore
    }
  }
})()
