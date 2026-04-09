import pkg from "electron";
import ENDPOINTS from "./config/index.js";
const { contextBridge, ipcRenderer } = pkg;
contextBridge.exposeInMainWorld(ENDPOINTS.api, {
    settings: {
        getData: (id) => ipcRenderer.invoke(ENDPOINTS.settings.getData, id),
        register: (data) => ipcRenderer.invoke(ENDPOINTS.settings.register, data),
        update: {
            username: (username) => ipcRenderer.invoke(ENDPOINTS.settings.update.username, username),
            developerMode: (developerMode) => ipcRenderer.invoke(ENDPOINTS.settings.update.developer_mode, developerMode),
        },
    },
    mods: {
        getAll: () => ipcRenderer.invoke(ENDPOINTS.mods.get.all),
        getByID: (id) => ipcRenderer.invoke(ENDPOINTS.mods.get.id, id),
        register: (mod) => ipcRenderer.invoke(ENDPOINTS.mods.register, mod),
        update: (mod) => ipcRenderer.invoke(ENDPOINTS.mods.update, mod),
        delete: (id) => ipcRenderer.invoke(ENDPOINTS.mods.delete, id),
    },
    statistics: {
        getByID: (id) => ipcRenderer.invoke(ENDPOINTS.statistics.get.id, id),
        register: (data) => ipcRenderer.invoke(ENDPOINTS.statistics.register, data),
        update: {
            totalPlayedByID: (data) => ipcRenderer.invoke(ENDPOINTS.statistics.update.total_played_by_id, data),
            lastPlayedAtByID: (data) => ipcRenderer.invoke(ENDPOINTS.statistics.update.last_played_at_by_id, data),
        },
    },
});
