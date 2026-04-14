import { promises as fs } from "fs";
import { createReadStream } from "fs";
import { returnObjetToResponseApi } from "../utils/querys.js";
import unzipper from "unzipper";
import pkg from "electron";
const { app, dialog } = pkg;
import path from "path";
import { exec } from "child_process";
import usersRepository from "./users.api.js";

const userData = () => {
  const response = usersRepository.getById(1);
  if (response.success && response.data && response.data.folder_path) {
    return response.data.folder_path;
  }
  return app.getPath("userData") as string;
};
const userDataPath: string = userData();

const filesRepository = {
  /* Utilidades para rutas */
  listFilesInExternalDirectory: async (
    directoryPath: string,
  ): Promise<ApiResponseDB<string[]>> => {
    try {
      const files = await fs.readdir(path.normalize(directoryPath));
      return returnObjetToResponseApi(
        true,
        "Archivos listados exitosamente",
        files,
      );
    } catch (error) {
      console.error("Error in listFilesInExternalDirectory:", error);
      return returnObjetToResponseApi(
        false,
        "Error al listar los archivos",
        [],
      );
    }
  },

  listFilesInInternalDirectory: async (
    directoryPath: string,
  ): Promise<ApiResponseDB<string[]>> => {
    try {
      const files = await fs.readdir(path.normalize(directoryPath));
      return returnObjetToResponseApi(
        true,
        "Archivos listados exitosamente",
        files,
      );
    } catch (error) {
      console.error("Error in listFilesInInternalDirectory:", error);
      return returnObjetToResponseApi(
        false,
        "Error al listar los archivos",
        [],
      );
    }
  },

  joinPaths: (...paths: string[]): string => {
    return path.join(...paths);
  },

  /* Métodos para manejo de archivos y directorios */

  checkDirectoryExists: async (pathTemp: string) => {
    try {
      const finalPath = path.isAbsolute(pathTemp)
        ? pathTemp
        : path.join(userDataPath, pathTemp);

      const exists = await fs
        .access(finalPath)
        .then(() => true)
        .catch(() => false);

      console.log("Checking path:", finalPath);
      console.log("Exists:", exists);

      return returnObjetToResponseApi(true, "OK", exists);
    } catch (error) {
      console.error(error);
      return returnObjetToResponseApi(false, "Error", false);
    }
  },
  createDirectory: async (pathTemp: string): Promise<ApiResponseDB> => {
    try {
      console.log("Attempting to create directory at", pathTemp);
      console.log("User path for directory creation:", userDataPath);
      console.log(
        "Full path for directory creation:",
        path.join(userDataPath, pathTemp),
      );
      await fs.mkdir(path.join(userDataPath, pathTemp), { recursive: true });
      console.log(
        "Directory created successfully at",
        path.join(userDataPath, pathTemp),
      );
      return returnObjetToResponseApi(
        true,
        "Directorio creado exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in createDirectory:", error);
      return returnObjetToResponseApi(
        false,
        "Error al crear el directorio",
        null,
      );
    }
  },
  copyDirectory: async (
    source: string,
    destination: string,
  ): Promise<ApiResponseDB> => {
    try {
      await fs.cp(
        path.normalize(source),
        path.join(userDataPath, destination),
        {
          recursive: true,
          force: true,
        },
      );
      console.log(
        "Directory copied successfully from",
        source,
        "to",
        destination,
      );
      return returnObjetToResponseApi(
        true,
        "Directorio copiado exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in copyDirectory:", error);
      return returnObjetToResponseApi(
        false,
        "Error al copiar el directorio",
        null,
      );
    }
  },

  copyDirectoryFree: async (
    source: string,
    destination: string,
  ): Promise<ApiResponseDB> => {
    try {
      await fs.cp(path.normalize(source), path.normalize(destination), {
        recursive: true,
        force: true,
      });
      console.log(
        "Directory copied successfully from",
        source,
        "to",
        destination,
      );
      return returnObjetToResponseApi(
        true,
        "Directorio copiado exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in copyDirectoryFree:", error);
      return returnObjetToResponseApi(
        false,
        "Error al copiar el directorio",
        null,
      );
    }
  },

  copyFile: async (
    source: string,
    destination: string,
  ): Promise<ApiResponseDB> => {
    try {
      const normalizedSource = path.normalize(source);
      const destinationPath = path.join(userDataPath, destination);

      await fs.mkdir(path.dirname(destinationPath), { recursive: true });
      await fs.rm(destinationPath, { force: true });
      await fs.copyFile(normalizedSource, destinationPath);
      console.log(
        "File copied successfully from",
        normalizedSource,
        "to",
        destinationPath,
      );

      return returnObjetToResponseApi(
        true,
        "Archivo copiado exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in copyFile:", error);
      return returnObjetToResponseApi(
        false,
        "Error al copiar el archivo",
        null,
      );
    }
  },
  copyInternalFile: async (
    source: string,
    destination: string,
  ): Promise<ApiResponseDB> => {
    try {
      const normalizedSource = path.join(userDataPath, path.normalize(source));
      const normalizedDestination = path.join(
        userDataPath,
        path.normalize(destination),
      );

      await fs.cp(normalizedSource, normalizedDestination, {
        recursive: true,
        force: true,
      });
      console.log(
        "Internal files copied successfully from",
        normalizedSource,
        "to",
        normalizedDestination,
      );

      return returnObjetToResponseApi(
        true,
        "Archivos copiados exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in copyInternalFile:", error);
      return returnObjetToResponseApi(
        false,
        "Error al copiar los archivos internos",
        null,
      );
    }
  },

  copyInternalDirectory: async (
    source: string,
    destination: string,
  ): Promise<ApiResponseDB> => {
    try {
      const normalizedSource = path.join(userDataPath, path.normalize(source));
      const normalizedDestination = path.join(
        userDataPath,
        path.normalize(destination),
      );

      const checkIFExistsFolderDestination =
        await filesRepository.checkDirectoryExists(normalizedDestination);

      if (!checkIFExistsFolderDestination?.data) {
        console.log(
          "Destination internal directory does not exist, cannot copy",
          normalizedDestination,
        );
        return returnObjetToResponseApi(
          false,
          "El directorio de destino no existe",
          null,
        );
      }

      await fs.cp(normalizedSource, normalizedDestination, {
        recursive: true,
        force: true,
      });
      console.log(
        "Internal directory copied successfully from",
        normalizedSource,
        "to",
        normalizedDestination,
      );

      return returnObjetToResponseApi(
        true,
        "Directorio copiado exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in copyInternalDirectory:", error);
      return returnObjetToResponseApi(
        false,
        "Error al copiar el directorio interno",
        null,
      );
    }
  },

  copyToInternalDirectory: async (
    source: string,
    destination: string,
  ): Promise<ApiResponseDB> => {
    try {
      const normalizedSource = path.normalize(source);
      const normalizedDestination = path.join(
        userDataPath,
        path.normalize(destination),
      );
      const checkIFExistsFolderDestination =
        await filesRepository.checkDirectoryExists(normalizedDestination);

      if (!checkIFExistsFolderDestination?.data) {
        const createDirResponse = await filesRepository.createDirectory(
          normalizedDestination,
        );
        if (!createDirResponse.success) {
          return returnObjetToResponseApi(
            false,
            "Error al crear el directorio de destino interno",
            null,
          );
        }
      }

      await fs.cp(normalizedSource, normalizedDestination, {
        recursive: true,
        force: true,
      });
      console.log(
        "Internal directory copied successfully from",
        normalizedSource,
        "to",
        normalizedDestination,
      );

      return returnObjetToResponseApi(
        true,
        "Directorio copiado exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in copyToInternalDirectory:", error);
      return returnObjetToResponseApi(
        false,
        "Error al copiar el directorio interno",
        null,
      );
    }
  },

  selectZipFile: async (): Promise<string | undefined> => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "ZIP Files", extensions: ["zip"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    return result.filePaths[0];
  },

  selectZipFiles: async (): Promise<string[]> => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [
        { name: "ZIP Files", extensions: ["zip"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    return result.filePaths;
  },

  selectFolder: async (): Promise<string | undefined> => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result.filePaths[0];
  },

  selectZipOrFolder: async (): Promise<string | undefined> => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile", "openDirectory"],
      filters: [
        { name: "ZIP Files", extensions: ["zip"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    return result.filePaths[0];
  },
  /* Método para descomprimir archivos ZIP */
  unzipFile: async (
    zipPath: string,
    extractTo: string,
  ): Promise<ApiResponseDB> => {
    try {
      await createReadStream(path.normalize(zipPath))
        .pipe(unzipper.Extract({ path: path.join(userDataPath, extractTo) }))
        .promise();
      console.log("File unzipped successfully from", zipPath, "to", extractTo);
      return returnObjetToResponseApi(
        true,
        "Archivo descomprimido exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in unzipFile:", error);
      return returnObjetToResponseApi(
        false,
        "Error al descomprimir el archivo",
        null,
      );
    }
  },
  /* Métodos para eliminar archivos o directorio */
  deleteFile: async (filePath: string): Promise<ApiResponseDB> => {
    try {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(userDataPath, filePath);

      await fs.rm(fullPath, { force: true });

      console.log("File deleted successfully:", fullPath);

      return returnObjetToResponseApi(
        true,
        "Archivo eliminado exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in deleteFile:", error);
      return returnObjetToResponseApi(
        false,
        "Error al eliminar el archivo",
        null,
      );
    }
  },
  deleteDirectory: async (dirPath: string): Promise<ApiResponseDB> => {
    try {
      const fullPath = path.isAbsolute(dirPath)
        ? dirPath
        : path.join(userDataPath, dirPath);

      await fs.rm(fullPath, { recursive: true, force: true });

      console.log("Directory deleted successfully:", fullPath);

      return returnObjetToResponseApi(
        true,
        "Directorio eliminado exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in deleteDirectory:", error);
      return returnObjetToResponseApi(
        false,
        "Error al eliminar el directorio",
        null,
      );
    }
  },
  /* Métodos para ejecutar aplicaciones o scripts */
  runAppMacOs: async (appPath: string): Promise<ApiResponseDB> => {
    try {
      const fullPath = path.join(userDataPath, appPath);
      exec(`open "${fullPath}"`, (error: any) => {
        if (error) {
          console.error("Error in runAppMacOs:", error);
          return returnObjetToResponseApi(
            false,
            "Error al ejecutar la aplicación",
            null,
          );
        }
      });
      return returnObjetToResponseApi(
        true,
        "Aplicación ejecutada exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in runAppMacOs:", error);
      return returnObjetToResponseApi(
        false,
        "Error al ejecutar la aplicación",
        null,
      );
    }
  },
  runAppWindows: async (appPath: string): Promise<ApiResponseDB> => {
    try {
      const fullPath = path.join(userDataPath, appPath);
      exec(`start "" "${fullPath}"`, (error: any) => {
        if (error) {
          console.error("Error in runAppWindows:", error);
          return returnObjetToResponseApi(
            false,
            "Error al ejecutar la aplicación",
            null,
          );
        }
      });
      return returnObjetToResponseApi(
        true,
        "Aplicación ejecutada exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in runAppWindows:", error);
      return returnObjetToResponseApi(
        false,
        "Error al ejecutar la aplicación",
        null,
      );
    }
  },
  runShLinux: async (scriptPath: string): Promise<ApiResponseDB> => {
    try {
      const fullPath = path.join(userDataPath, scriptPath);
      exec(`sh "${fullPath}"`, (error: any) => {
        if (error) {
          console.error("Error in runShLinux:", error);
          return returnObjetToResponseApi(
            false,
            "Error al ejecutar el script",
            null,
          );
        }
      });
      return returnObjetToResponseApi(
        true,
        "Script ejecutado exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in runShLinux:", error);
      return returnObjetToResponseApi(
        false,
        "Error al ejecutar el script",
        null,
      );
    }
  },
};

export default filesRepository;
