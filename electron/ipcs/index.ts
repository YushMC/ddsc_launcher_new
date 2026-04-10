import pkg from "electron";
import modsRepository from "../api/mods.api.js";
import usersRepository from "../api/users.api.js";
import statisticsRepository from "../api/statistics.api.js";
import filesRepository from "../api/files.api.js";
import ENDPOINTS from "../config/index.js";

const { ipcMain } = pkg;

export const BDpc = () => {
  /* endpoints para mods */
  ipcMain.handle(
    ENDPOINTS.mods.get.id,
    (_, id: number): ApiResponseDB<ModInterface> => {
      return modsRepository.getAllDataModById(id);
    },
  );
  ipcMain.handle(ENDPOINTS.mods.get.all, (): ApiResponseDB<ModInterface[]> => {
    return modsRepository.getAllDataMods();
  });

  ipcMain.handle(
    ENDPOINTS.mods.register,
    (_, data: ModInterface): ApiResponseDB<{ exist: boolean }> => {
      return modsRepository.create(data);
    },
  );

  ipcMain.handle(
    ENDPOINTS.mods.update,
    (_, data: ModInterface): ApiResponseDB => {
      return modsRepository.update(data);
    },
  );
  ipcMain.handle(ENDPOINTS.mods.delete, (_, id: number): ApiResponseDB => {
    return modsRepository.delete(id);
  });

  /* endpoints para usuarios*/
  ipcMain.handle(
    ENDPOINTS.users.get.byID,
    (_, id: number): ApiResponseDB<UserInterface> => {
      return usersRepository.getById(id);
    },
  );

  ipcMain.handle(
    ENDPOINTS.users.get.all,
    (): ApiResponseDB<UserInterface[]> => {
      return usersRepository.getAll();
    },
  );

  ipcMain.handle(
    ENDPOINTS.users.register,
    (_, username: string): ApiResponseDB<any> => {
      return usersRepository.create(username);
    },
  );
  ipcMain.handle(
    ENDPOINTS.users.update.username,
    (_, data: UserInterface): ApiResponseDB => {
      return usersRepository.updateUsername(data);
    },
  );

  ipcMain.handle(
    ENDPOINTS.users.update.developer_mode,
    (_, data: UserInterface): ApiResponseDB => {
      return usersRepository.updateDeveloperMode(data);
    },
  );

  /* endpoints para estadísticas */
  ipcMain.handle(
    ENDPOINTS.statistics.get.id,
    (_, id: number): ApiResponseDB<any> => {
      return statisticsRepository.getDataStatisticsById(id);
    },
  );
  ipcMain.handle(
    ENDPOINTS.statistics.register,
    (_, data: { id_mod: number; id_user: number }): ApiResponseDB<any> => {
      return statisticsRepository.create(data.id_mod, data.id_user);
    },
  );
  ipcMain.handle(
    ENDPOINTS.statistics.update.total_played_by_id,
    (_, data: { id: number; total_played: string }): ApiResponseDB => {
      return statisticsRepository.updateTotalPlayedById(
        data.id,
        data.total_played,
      );
    },
  );
  ipcMain.handle(
    ENDPOINTS.statistics.update.last_played_at_by_id,
    (_, data: { id: number; last_played_at: string }): ApiResponseDB => {
      return statisticsRepository.updateLastPlayedAtById(
        data.id,
        data.last_played_at,
      );
    },
  );
};

export const Filespc = () => {
  /* endpoints para archivos */
  ipcMain.handle(
    ENDPOINTS.files.check,
    async (_, filePath: string): Promise<ApiResponseDB<boolean>> => {
      return await filesRepository.checkDirectoryExists(filePath);
    },
  );

  ipcMain.handle(ENDPOINTS.files.joinPaths, (_, ...paths: string[]): string => {
    return filesRepository.joinPaths(...paths);
  });

  ipcMain.handle(
    ENDPOINTS.files.create.directory,
    async (_, pathTemp: string): Promise<ApiResponseDB> => {
      return await filesRepository.createDirectory(pathTemp);
    },
  );

  ipcMain.handle(
    ENDPOINTS.files.copy.directory,
    async (
      _,
      data: { source: string; destination: string },
    ): Promise<ApiResponseDB> => {
      return await filesRepository.copyDirectory(data.source, data.destination);
    },
  );

  ipcMain.handle(
    ENDPOINTS.files.copy.file,
    async (
      _,
      data: { source: string; destination: string },
    ): Promise<ApiResponseDB> => {
      return await filesRepository.copyFile(data.source, data.destination);
    },
  );

  ipcMain.handle(
    ENDPOINTS.files.copy.internal.file,
    async (
      _,
      data: { source: string; destination: string },
    ): Promise<ApiResponseDB> => {
      return await filesRepository.copyInternalFile(
        data.source,
        data.destination,
      );
    },
  );

  ipcMain.handle(
    ENDPOINTS.files.copy.internal.directory,
    async (
      _,
      data: { source: string; destination: string },
    ): Promise<ApiResponseDB> => {
      return await filesRepository.copyInternalDirectory(
        data.source,
        data.destination,
      );
    },
  );
  /* endpoint para descomprimir archivos */

  ipcMain.handle(
    ENDPOINTS.files.unzip.file,
    async (
      _,
      data: { zipPath: string; extractTo: string },
    ): Promise<ApiResponseDB> => {
      return await filesRepository.unzipFile(data.zipPath, data.extractTo);
    },
  );

  ipcMain.handle(
    ENDPOINTS.files.select.zipFile,
    async (): Promise<string | undefined> => {
      return await filesRepository.selectZipFile();
    },
  );

  ipcMain.handle(
    ENDPOINTS.files.select.zipFiles,
    async (): Promise<string[]> => {
      return await filesRepository.selectZipFiles();
    },
  );

  ipcMain.handle(
    ENDPOINTS.files.select.folder,
    async (): Promise<string | undefined> => {
      return await filesRepository.selectFolder();
    },
  );

  ipcMain.handle(
    ENDPOINTS.files.select.zipOrFolder,
    async (): Promise<string | undefined> => {
      return await filesRepository.selectZipOrFolder();
    },
  );

  /* endpoints para ejecutar archivos */

  ipcMain.handle(
    ENDPOINTS.files.run.macos,
    async (_, filePath: string): Promise<ApiResponseDB> => {
      return await filesRepository.runAppMacOs(filePath);
    },
  );

  ipcMain.handle(
    ENDPOINTS.files.run.windows,
    async (_, filePath: string): Promise<ApiResponseDB> => {
      return await filesRepository.runAppWindows(filePath);
    },
  );

  ipcMain.handle(
    ENDPOINTS.files.run.linux,
    async (_, filePath: string): Promise<ApiResponseDB> => {
      return await filesRepository.runShLinux(filePath);
    },
  );
};
