import pkg from "electron";
import ENDPOINTS from "./config/index.js";

const { contextBridge, ipcRenderer } = pkg;

contextBridge.exposeInMainWorld(ENDPOINTS.api, {
  settings: {
    getData: (id: number): Promise<ApiResponseDB<SettingsInterface>> =>
      ipcRenderer.invoke(ENDPOINTS.settings.getData, id),

    register: (data: SettingsInterface): Promise<ApiResponseDB> =>
      ipcRenderer.invoke(ENDPOINTS.settings.register, data),

    update: {
      username: (username: string): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(ENDPOINTS.settings.update.username, username),

      developerMode: (developerMode: boolean): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(
          ENDPOINTS.settings.update.developer_mode,
          developerMode,
        ),
    },
  },

  mods: {
    getAll: (): Promise<ApiResponseDB<ModInterface[]>> =>
      ipcRenderer.invoke(ENDPOINTS.mods.get.all),

    getByID: (id: number): Promise<ApiResponseDB<ModInterface>> =>
      ipcRenderer.invoke(ENDPOINTS.mods.get.id, id),

    register: (mod: ModInterface): Promise<ApiResponseDB> =>
      ipcRenderer.invoke(ENDPOINTS.mods.register, mod),

    update: (mod: ModInterface): Promise<ApiResponseDB> =>
      ipcRenderer.invoke(ENDPOINTS.mods.update, mod),

    delete: (id: number) => ipcRenderer.invoke(ENDPOINTS.mods.delete, id),
  },

  statistics: {
    getByID: (id: number): Promise<ApiResponseDB<any>> =>
      ipcRenderer.invoke(ENDPOINTS.statistics.get.id, id),

    register: (data: {
      id_mod: number;
      id_user: number;
    }): Promise<ApiResponseDB> =>
      ipcRenderer.invoke(ENDPOINTS.statistics.register, data),

    update: {
      totalPlayedByID: (data: {
        id: number;
        total_played: string;
      }): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(
          ENDPOINTS.statistics.update.total_played_by_id,
          data,
        ),

      lastPlayedAtByID: (data: {
        id: number;
        last_played_at: string;
      }): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(
          ENDPOINTS.statistics.update.last_played_at_by_id,
          data,
        ),
    },
  },
});
