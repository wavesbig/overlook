import { ipcRenderer } from 'electron'

// Generic implementations keyed by ElectronStore types for clarity
export async function storeGet<K extends ElectronStore.StoreKey>(
  key: K
): Promise<ElectronStore.StoreEntry<K> | undefined> {
  return ipcRenderer.invoke('store:get', key)
}

export async function storeSet<K extends ElectronStore.StoreKey>(
  key: K,
  val: ElectronStore.StoreEntry<K>
): Promise<void> {
  await ipcRenderer.invoke('store:set', key, val)
}

export const storeAPI: ElectronStore.StoreAPI = { storeGet, storeSet }
