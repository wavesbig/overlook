import Store from 'electron-store'

const store = new Store<ElectronStore.StoreValueMap>({
  name: 'gridcards',
  schema: { cards: { type: 'object', additionalProperties: true }, layout: { type: 'array' } }
})

// 导出简单的操作方法
export function getStoreValue<T = ElectronStore.StoreEntry>(
  key: ElectronStore.StoreKey
): T | undefined {
  return store.get(key) as T
}

export function setStoreValue<T = unknown>(key: ElectronStore.StoreKey, value: T): void {
  store.set(key, value)
}

export function deleteStoreKey(key: ElectronStore.StoreKey): void {
  store.delete(key)
}
