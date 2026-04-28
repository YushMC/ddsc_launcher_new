import { constants, promises as fs } from "fs";
import { createReadStream } from "fs";
import { returnObjetToResponseApi } from "../utils/querys.js";
import unzipper from "unzipper";
import pkg from "electron";
const { app, dialog } = pkg;
import path from "path";
import { exec } from "child_process";
import usersRepository from "./users.api.js";

let cachedUserDataPath: string | null = null;

const getUserDataPath = (): string => {
  // Si ya tenemos la ruta en cache, retornarla
  if (cachedUserDataPath) {
    return cachedUserDataPath;
  }

  try {
    const response = usersRepository.getById(1);
    if (response.success && response.data && response.data.folder_path) {
      cachedUserDataPath = response.data.folder_path;
      return cachedUserDataPath ?? app.getPath("userData");
    }
  } catch (error) {
    console.warn("Could not fetch user data path from database:", error);
  }

  // Fallback a la ruta por defecto
  cachedUserDataPath = app.getPath("userData") as string;
  return cachedUserDataPath;
};

const filesRepository = {
  /* Utilidades para rutas */
  listFilesInExternalDirectory: async (
    directoryPath: string,
  ): Promise<ApiResponseDB<string[]>> => {
    try {
      const finalDirectoryPath = path.isAbsolute(directoryPath)
        ? directoryPath
        : path.join(getUserDataPath(), directoryPath);
      const files = await fs.readdir(path.normalize(finalDirectoryPath));
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

  getAbsoluteDefaultPath: (name: string): string => {
    return path.join(path.resolve(getUserDataPath()), name);
  },

  /* MÃ©todos para manejo de archivos y directorios */

  checkDirectoryExists: async (pathTemp: string) => {
    try {
      const finalPath = path.isAbsolute(pathTemp)
        ? pathTemp
        : path.join(getUserDataPath(), pathTemp);

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
      const finalPath = path.isAbsolute(pathTemp)
        ? pathTemp
        : path.join(getUserDataPath(), pathTemp);
      await fs.mkdir(finalPath, {
        recursive: true,
      });
      console.log("Directory created successfully at", finalPath);
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
      const finalSource = path.isAbsolute(source)
        ? source
        : path.join(getUserDataPath(), source);
      const finalDestination = path.isAbsolute(destination)
        ? destination
        : path.join(getUserDataPath(), destination);
      await fs.cp(
        path.normalize(finalSource),
        path.normalize(finalDestination),
        {
          recursive: true,
          force: true,
        },
      );
      console.log(
        "Directory copied successfully from",
        finalSource,
        "to",
        finalDestination,
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
      const normalizedSource = path.isAbsolute(source)
        ? path.normalize(source)
        : path.join(getUserDataPath(), path.normalize(source));
      const destinationPath = path.isAbsolute(destination)
        ? path.normalize(destination)
        : path.join(getUserDataPath(), path.normalize(destination));

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
      const normalizedSource = path.join(
        getUserDataPath(),
        path.normalize(source),
      );
      const normalizedDestination = path.join(
        getUserDataPath(),
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
      const normalizedSource = path.isAbsolute(source)
        ? path.normalize(source)
        : path.join(getUserDataPath(), path.normalize(source));
      const normalizedDestination = path.isAbsolute(destination)
        ? path.normalize(destination)
        : path.join(getUserDataPath(), path.normalize(destination));

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
      const normalizedDestination = path.isAbsolute(destination)
        ? path.normalize(destination)
        : path.join(getUserDataPath(), path.normalize(destination));
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
  /* MÃ©todo para descomprimir archivos ZIP */
  unzipFile: async (
    zipPath: string,
    extractTo: string,
  ): Promise<ApiResponseDB> => {
    try {
      const finalextractTo = path.isAbsolute(extractTo)
        ? extractTo
        : path.join(getUserDataPath(), extractTo);

      await createReadStream(path.normalize(zipPath))
        .pipe(unzipper.Extract({ path: finalextractTo }))
        .promise();
      console.log(
        "File unzipped successfully from",
        zipPath,
        "to",
        finalextractTo,
      );
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
  /* MÃ©todos para eliminar archivos o directorio */
  deleteFile: async (filePath: string): Promise<ApiResponseDB> => {
    try {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(getUserDataPath(), filePath);

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
        : path.join(getUserDataPath(), dirPath);

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
  /* MÃ©todos para ejecutar aplicaciones o scripts */
  runAppMacOs: async (appPath: string): Promise<ApiResponseDB> => {
    try {
      const finalPath = path.isAbsolute(appPath)
        ? appPath
        : path.join(getUserDataPath(), appPath);
      exec(`open "${finalPath}"`, (error: any) => {
        if (error) {
          console.error("Error in runAppMacOs:", error);
          return returnObjetToResponseApi(
            false,
            "Error al ejecutar la aplicaciÃ³n",
            null,
          );
        }
      });
      return returnObjetToResponseApi(
        true,
        "AplicaciÃ³n ejecutada exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in runAppMacOs:", error);
      return returnObjetToResponseApi(
        false,
        "Error al ejecutar la aplicaciÃ³n",
        null,
      );
    }
  },
  runAppWindows: async (appPath: string): Promise<ApiResponseDB> => {
    try {
      const finalPath = path.isAbsolute(appPath)
        ? appPath
        : path.join(getUserDataPath(), appPath);
      exec(`start "" "${finalPath}"`, (error: any) => {
        if (error) {
          console.error("Error in runAppWindows:", error);
          return returnObjetToResponseApi(
            false,
            "Error al ejecutar la aplicaciÃ³n",
            null,
          );
        }
      });
      return returnObjetToResponseApi(
        true,
        "AplicaciÃ³n ejecutada exitosamente",
        null,
      );
    } catch (error) {
      console.error("Error in runAppWindows:", error);
      return returnObjetToResponseApi(
        false,
        "Error al ejecutar la aplicaciÃ³n",
        null,
      );
    }
  },
  runShLinux: async (scriptPath: string): Promise<ApiResponseDB> => {
    try {
      const finalPath = path.isAbsolute(scriptPath)
        ? scriptPath
        : path.join(getUserDataPath(), scriptPath);

      // Asignar permisos ejecutables al archivo
      const dir = path.dirname(finalPath);

      await ensurePermissionsRecursive(dir);

      exec(`sh "${finalPath}"`, (error: any) => {
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

async function ensurePermissionsRecursive(dir: string) {
  try {
    await fs.access(dir, constants.R_OK | constants.X_OK);
  } catch {
    await fs.chmod(dir, 0o755);
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await ensurePermissionsRecursive(fullPath);
    } else {
      try {
        await fs.access(fullPath, constants.X_OK);
      } catch {
        await fs.chmod(fullPath, 0o777);
      }
    }
  }
}

export default filesRepository;
