import { promises as fs } from "fs";
import { createReadStream } from "fs";
import { returnObjetToResponseApi } from "../utils/querys.js";
import unzipper from "unzipper";
import pkg from "electron";
const { app, dialog } = pkg;
import path from "path";
const userDataPath = app.getPath("userData");
const filesRepository = {
    /* Métodos para manejo de archivos y directorios */
    checkDirectoryExists: async (pathTemp) => {
        try {
            const exists = await fs
                .access(path.join(userDataPath, pathTemp))
                .then(() => true)
                .catch(() => false);
            console.log("Directory check result for", pathTemp, ":", exists);
            return returnObjetToResponseApi(true, "Verificación de directorio exitosa", exists);
        }
        catch (error) {
            console.error("Error in checkDirectoryExists:", error);
            return returnObjetToResponseApi(false, "Error al verificar el directorio", false);
        }
    },
    createDirectory: async (pathTemp) => {
        try {
            await fs.mkdir(path.join(userDataPath, pathTemp), { recursive: true });
            return returnObjetToResponseApi(true, "Directorio creado exitosamente", null);
        }
        catch (error) {
            console.error("Error in createDirectory:", error);
            return returnObjetToResponseApi(false, "Error al crear el directorio", null);
        }
    },
    copyDirectory: async (source, destination) => {
        try {
            await fs.cp(path.normalize(source), path.join(userDataPath, destination), {
                recursive: true,
                force: true,
            });
            return returnObjetToResponseApi(true, "Directorio copiado exitosamente", null);
        }
        catch (error) {
            console.error("Error in copyDirectory:", error);
            return returnObjetToResponseApi(false, "Error al copiar el directorio", null);
        }
    },
    copyFile: async (source, destination) => {
        try {
            const normalizedSource = path.normalize(source);
            const destinationPath = path.join(userDataPath, destination);
            await fs.mkdir(path.dirname(destinationPath), { recursive: true });
            await fs.rm(destinationPath, { force: true });
            await fs.copyFile(normalizedSource, destinationPath);
            return returnObjetToResponseApi(true, "Archivo copiado exitosamente", null);
        }
        catch (error) {
            console.error("Error in copyFile:", error);
            return returnObjetToResponseApi(false, "Error al copiar el archivo", null);
        }
    },
    selectZipFile: async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [
                { name: "ZIP Files", extensions: ["zip"] },
                { name: "All Files", extensions: ["*"] },
            ],
        });
        return result.filePaths[0];
    },
    selectZipFiles: async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openFile", "multiSelections"],
            filters: [
                { name: "ZIP Files", extensions: ["zip"] },
                { name: "All Files", extensions: ["*"] },
            ],
        });
        return result.filePaths;
    },
    selectFolder: async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });
        return result.filePaths[0];
    },
    selectZipOrFolder: async () => {
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
    unzipFile: async (zipPath, extractTo) => {
        try {
            await createReadStream(path.normalize(zipPath))
                .pipe(unzipper.Extract({ path: path.join(userDataPath, extractTo) }))
                .promise();
            return returnObjetToResponseApi(true, "Archivo descomprimido exitosamente", null);
        }
        catch (error) {
            console.error("Error in unzipFile:", error);
            return returnObjetToResponseApi(false, "Error al descomprimir el archivo", null);
        }
    },
    /* Métodos para ejecutar aplicaciones o scripts */
    runAppMacOs: async (appPath) => {
        try {
            const { exec } = require("child_process");
            exec(`open "${appPath}"`, (error) => {
                if (error) {
                    console.error("Error in runAppMacOs:", error);
                    return returnObjetToResponseApi(false, "Error al ejecutar la aplicación", null);
                }
            });
            return returnObjetToResponseApi(true, "Aplicación ejecutada exitosamente", null);
        }
        catch (error) {
            console.error("Error in runAppMacOs:", error);
            return returnObjetToResponseApi(false, "Error al ejecutar la aplicación", null);
        }
    },
    runAppWindows: async (appPath) => {
        try {
            const { exec } = require("child_process");
            exec(`start "" "${appPath}"`, (error) => {
                if (error) {
                    console.error("Error in runAppWindows:", error);
                    return returnObjetToResponseApi(false, "Error al ejecutar la aplicación", null);
                }
            });
            return returnObjetToResponseApi(true, "Aplicación ejecutada exitosamente", null);
        }
        catch (error) {
            console.error("Error in runAppWindows:", error);
            return returnObjetToResponseApi(false, "Error al ejecutar la aplicación", null);
        }
    },
    runShLinux: async (scriptPath) => {
        try {
            const { exec } = require("child_process");
            exec(`sh "${scriptPath}"`, (error) => {
                if (error) {
                    console.error("Error in runShLinux:", error);
                    return returnObjetToResponseApi(false, "Error al ejecutar el script", null);
                }
            });
            return returnObjetToResponseApi(true, "Script ejecutado exitosamente", null);
        }
        catch (error) {
            console.error("Error in runShLinux:", error);
            return returnObjetToResponseApi(false, "Error al ejecutar el script", null);
        }
    },
};
export default filesRepository;
