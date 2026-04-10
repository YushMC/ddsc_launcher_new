import pkg from "electron";
import ENDPOINTS from "./config/index.js";

const { contextBridge, ipcRenderer } = pkg;

contextBridge.exposeInMainWorld(ENDPOINTS.api, {
  users: {
    get: {
      byID: (id: number): Promise<ApiResponseDB<UserInterface>> =>
        ipcRenderer.invoke(ENDPOINTS.users.get.byID, id),

      all: (): Promise<ApiResponseDB<UserInterface[]>> =>
        ipcRenderer.invoke(ENDPOINTS.users.get.all),
    },

    register: (username: string): Promise<ApiResponseDB> =>
      ipcRenderer.invoke(ENDPOINTS.users.register, username),

    update: {
      username: (username: string): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(ENDPOINTS.users.update.username, username),

      developerMode: (developerMode: boolean): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(
          ENDPOINTS.users.update.developer_mode,
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

  files: {
    check: (path: string): Promise<ApiResponseDB> =>
      ipcRenderer.invoke(ENDPOINTS.files.check, path),
    copy: {
      file: (source: string, destination: string): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(ENDPOINTS.files.copy.file, source, destination),

      directory: (
        source: string,
        destination: string,
      ): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(ENDPOINTS.files.copy.directory, source, destination),
    },
    create: {
      directory: (path: string): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(ENDPOINTS.files.create.directory, path),
    },
    unzip: {
      file: (zipPath: string, extractTo: string): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(ENDPOINTS.files.unzip.file, zipPath, extractTo),
    },
    run: {
      macos: (filePath: string): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(ENDPOINTS.files.run.macos, filePath),

      windows: (filePath: string): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(ENDPOINTS.files.run.windows, filePath),

      linux: (filePath: string): Promise<ApiResponseDB> =>
        ipcRenderer.invoke(ENDPOINTS.files.run.linux, filePath),
    },
  },
});
