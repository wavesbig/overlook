import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      storeGet: <T = any>(key: 'cards' | 'layout') => Promise<T | undefined>
      storeSet: (key: 'cards' | 'layout', val: any) => Promise<void>
    }
  }
}
