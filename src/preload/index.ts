import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  storeGet: async <T = any>(key: 'cards' | 'layout'): Promise<T | undefined> => {
    return ipcRenderer.invoke('store:get', key)
  },
  storeSet: async (key: 'cards' | 'layout', val: any): Promise<void> => {
    await ipcRenderer.invoke('store:set', key, val)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
