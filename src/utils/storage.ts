import { storage } from "webextension-polyfill";

export default {
  get: async (name: string) => {
    const value = await storage.sync.get(name);

    return value?.[name];
  },
  set: async (data) => {
    return await storage.sync.set(data);
  }
};