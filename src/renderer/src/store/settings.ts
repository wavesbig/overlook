import { create } from 'zustand'
import {
  applyTheme,
  applyFontScale,
  normalizeSettings,
  applyDefaults
} from '@renderer/lib/settings'

// 设置状态：主题与字体缩放
// - themeMode：主题模式（system/light/dark）
// - fontScale：字体缩放比例（单位倍数）
// - setThemeMode / setFontScale：更新状态并应用全局副作用
type SettingsState = {
  themeMode: Settings.ThemeMode
  fontScale: number
  setThemeMode: (m: Settings.ThemeMode) => void
  setFontScale: (v: number) => void
}

// 持久化仓库：与主进程 electron-store 交互
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
  // 仅持久化传入字段，减少无效写入
  async persist(
    data: Partial<{ themeMode: Settings.ThemeMode; fontScale: number }>
  ): Promise<void> {
    try {
      if (window.api?.storeSet) {
        const settings = await window.api.storeGet('settings')
        await window.api.storeSet('settings', {
          ...settings,
          themeMode: data.themeMode ?? 'system',
          fontScale: data.fontScale ?? 1.0
        })
      }
    } catch {
      // ignore
    }
  }
}

let saveTimer: number | undefined
// 防抖写入：延迟持久化减少 IO 次数
function debounceSave(
  payload: Partial<{ themeMode: Settings.ThemeMode; fontScale: number }>
): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    void repository.persist(payload)
  }, 300)
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  themeMode: 'system',
  fontScale: 1.0,
  setThemeMode(m) {
    const { themeMode } = get()
    // 若值未变化则跳过操作
    if (themeMode === m) return
    set({ themeMode: m })
    // Apply theme immediately
    try {
      applyTheme(m)
    } catch {
      // ignore
    }
    debounceSave({ themeMode: m })
  },
  setFontScale(v) {
    const { fontScale } = get()
    // 若值未变化则跳过操作
    if (fontScale === v) return
    set({ fontScale: v })
    // Apply font scale immediately
    try {
      applyFontScale(v)
    } catch {
      // ignore
    }
    debounceSave({ fontScale: v })
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
