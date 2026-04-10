import pkg from "electron";
import ENDPOINTS from "./config/index.js";
const { contextBridge, ipcRenderer } = pkg;
contextBridge.exposeInMainWorld(ENDPOINTS.api, {
    users: {
        get: {
            byID: (id) => ipcRenderer.invoke(ENDPOINTS.users.get.byID, id),
            all: () => ipcRenderer.invoke(ENDPOINTS.users.get.all),
        },
        register: (username) => ipcRenderer.invoke(ENDPOINTS.users.register, username),
        update: {
            username: (username) => ipcRenderer.invoke(ENDPOINTS.users.update.username, username),
            developerMode: (developerMode) => ipcRenderer.invoke(ENDPOINTS.users.update.developer_mode, developerMode),
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
    files: {
        check: (path) => ipcRenderer.invoke(ENDPOINTS.files.check, path),
        copy: {
            file: (source, destination) => ipcRenderer.invoke(ENDPOINTS.files.copy.file, source, destination),
            directory: (source, destination) => ipcRenderer.invoke(ENDPOINTS.files.copy.directory, source, destination),
        },
        create: {
            directory: (path) => ipcRenderer.invoke(ENDPOINTS.files.create.directory, path),
        },
        unzip: {
            file: (zipPath, extractTo) => ipcRenderer.invoke(ENDPOINTS.files.unzip.file, zipPath, extractTo),
        },
        run: {
            macos: (filePath) => ipcRenderer.invoke(ENDPOINTS.files.run.macos, filePath),
            windows: (filePath) => ipcRenderer.invoke(ENDPOINTS.files.run.windows, filePath),
            linux: (filePath) => ipcRenderer.invoke(ENDPOINTS.files.run.linux, filePath),
        },
    },
});
