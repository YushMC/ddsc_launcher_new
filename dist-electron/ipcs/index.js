import { ipcMain } from "electron";
import modsRepository from "../api/mods.api.js";
import settingsRepository from "../api/settings.api.js";
import statisticsRepository from "../api/statistics.api.js";
import ENDPOINTS from "../config/index.js";
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
    /* endpoints para ajustes*/
    ipcMain.handle(ENDPOINTS.settings.getData, (_, id) => {
        return settingsRepository.getDataSettingById(id);
    });
    ipcMain.handle(ENDPOINTS.settings.register, (_, data) => {
        return settingsRepository.create(data);
    });
    ipcMain.handle(ENDPOINTS.settings.update.username, (_, data) => {
        return settingsRepository.updateUsername(data);
    });
    ipcMain.handle(ENDPOINTS.settings.update.developer_mode, (_, data) => {
        return settingsRepository.updateDeveloperMode(data);
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
