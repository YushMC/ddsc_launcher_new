import pkg from "electron";
import modsRepository from "../api/mods.api.js";
import usersRepository from "../api/users.api.js";
import statisticsRepository from "../api/statistics.api.js";
import filesRepository from "../api/files.api.js";
import ENDPOINTS from "../config/index.js";
const { ipcMain } = pkg;
export const BDpc = () => {
    /* endpoints para mods */
    ipcMain.handle(ENDPOINTS.mods.get.id, (_, id) => {
        return modsRepository.getAllDataModById(id);
    });
    ipcMain.handle(ENDPOINTS.mods.get.all, () => {
        return modsRepository.getAllDataMods();
    });
    ipcMain.handle(ENDPOINTS.mods.update, (_, data) => {
        return modsRepository.update(data);
    });
    ipcMain.handle(ENDPOINTS.mods.delete, (_, id) => {
        return modsRepository.delete(id);
    });
    /* endpoints para usuarios*/
    ipcMain.handle(ENDPOINTS.users.get.byID, (_, id) => {
        return usersRepository.getById(id);
    });
    ipcMain.handle(ENDPOINTS.users.get.all, () => {
        return usersRepository.getAll();
    });
    ipcMain.handle(ENDPOINTS.users.register, (_, username) => {
        return usersRepository.create(username);
    });
    ipcMain.handle(ENDPOINTS.users.update.username, (_, data) => {
        return usersRepository.updateUsername(data);
    });
    ipcMain.handle(ENDPOINTS.users.update.developer_mode, (_, data) => {
        return usersRepository.updateDeveloperMode(data);
    });
    /* endpoints para estadísticas */
    ipcMain.handle(ENDPOINTS.statistics.get.id, (_, id) => {
        return statisticsRepository.getDataStatisticsById(id);
    });
    ipcMain.handle(ENDPOINTS.statistics.register, (_, data) => {
        return statisticsRepository.create(data.id_mod, data.id_user);
    });
    ipcMain.handle(ENDPOINTS.statistics.update.total_played_by_id, (_, data) => {
        return statisticsRepository.updateTotalPlayedById(data.id, data.total_played);
    });
    ipcMain.handle(ENDPOINTS.statistics.update.last_played_at_by_id, (_, data) => {
        return statisticsRepository.updateLastPlayedAtById(data.id, data.last_played_at);
    });
};
export const Filespc = () => {
    /* endpoints para archivos */
    ipcMain.handle(ENDPOINTS.files.check, async (_, filePath) => {
        return await filesRepository.checkDirectoryExists(filePath);
    });
    ipcMain.handle(ENDPOINTS.files.joinPaths, (_, ...paths) => {
        return filesRepository.joinPaths(...paths);
    });
    ipcMain.handle(ENDPOINTS.files.create.directory, async (_, pathTemp) => {
        return await filesRepository.createDirectory(pathTemp);
    });
    ipcMain.handle(ENDPOINTS.files.copy.directory, async (_, data) => {
        return await filesRepository.copyDirectory(data.source, data.destination);
    });
    ipcMain.handle(ENDPOINTS.files.copy.file, async (_, data) => {
        return await filesRepository.copyFile(data.source, data.destination);
    });
    ipcMain.handle(ENDPOINTS.files.copy.internal, async (_, data) => {
        return await filesRepository.copyInternalFile(data.source, data.destination);
    });
    ipcMain.handle(ENDPOINTS.files.copy.internalDirectory, async (_, data) => {
        return await filesRepository.copyInternalDirectory(data.source, data.destination);
    });
    /* endpoint para descomprimir archivos */
    ipcMain.handle(ENDPOINTS.files.unzip.file, async (_, data) => {
        return await filesRepository.unzipFile(data.zipPath, data.extractTo);
    });
    ipcMain.handle(ENDPOINTS.files.select.zipFile, async () => {
        return await filesRepository.selectZipFile();
    });
    ipcMain.handle(ENDPOINTS.files.select.zipFiles, async () => {
        return await filesRepository.selectZipFiles();
    });
    ipcMain.handle(ENDPOINTS.files.select.folder, async () => {
        return await filesRepository.selectFolder();
    });
    ipcMain.handle(ENDPOINTS.files.select.zipOrFolder, async () => {
        return await filesRepository.selectZipOrFolder();
    });
    /* endpoints para ejecutar archivos */
    ipcMain.handle(ENDPOINTS.files.run.macos, async (_, filePath) => {
        return await filesRepository.runAppMacOs(filePath);
    });
    ipcMain.handle(ENDPOINTS.files.run.windows, async (_, filePath) => {
        return await filesRepository.runAppWindows(filePath);
    });
    ipcMain.handle(ENDPOINTS.files.run.linux, async (_, filePath) => {
        return await filesRepository.runShLinux(filePath);
    });
};
