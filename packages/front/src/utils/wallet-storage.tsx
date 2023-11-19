import localforage from 'localforage';

const defaultPath = '/opact-wallet'

export const walletStorage = {
  async get (path = defaultPath): Promise<string | Buffer | null> {
    return localforage.getItem(path);
  },

  async store (
    item: string | Uint8Array,
    path = defaultPath,
  ) {
    return await localforage.setItem(path, item);
  },

  async exists (path = defaultPath): Promise<boolean> {
    return (await localforage.getItem(path)) != null
  }
}
