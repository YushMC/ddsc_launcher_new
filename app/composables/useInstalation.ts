import type { SystemName } from "~/types/systemData";

const getAllNamesInExternalDirectory = async (directoryPath: string) => {
  try {
    const response = await window.api.files.list.external(directoryPath);
    if (!response.success) {
      return {
        success: false,
        message: `Error listing directory: ${response.message}`,
      };
    }
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const isExeFilesInDirectory = async (directoryPath: string) => {
  const listResponse = await getAllNamesInExternalDirectory(directoryPath);

  if (!listResponse.success || !listResponse.data) {
    return {
      success: false,
      message: `Error listing directory: ${listResponse.message}`,
    };
  }

  const exeFiles = listResponse.data.filter(
    (fileName) => fileName.endsWith(".exe") || fileName.endsWith(".sh"),
  );

  if (exeFiles.length === 0) {
    return {
      success: false,
      message: "No executable files found in the directory.",
    };
  }
  return {
    success: true,
    data: exeFiles,
  };
};

const getCustomExecutableInList = async (
  directoryPath: string,
  osName: SystemName,
) => {
  const exeFilesResponse = await isExeFilesInDirectory(directoryPath);

  if (!exeFilesResponse.success || !exeFilesResponse.data) {
    return {
      success: false,
      message: `Error checking for executable files: ${exeFilesResponse.message}`,
    };
  }
  const filesWithExeExtension = exeFilesResponse.data;

  const DDLCExes = filesWithExeExtension.filter(
    (fileName) => !fileName.endsWith("-32.exe"),
  );
  if (DDLCExes.length === 0) {
    return {
      success: false,
      message: "No executable files found in the directory.",
    };
  }

  const DDLCExe = DDLCExes.find((fileName) => fileName === "DDLC.exe");

  if (DDLCExe) {
    return {
      success: false,
      message:
        "Se encontró el archivo ejecutable principal (DDLC.exe) en la carpeta, este mod ya esta configurado.",
    };
  }

  const executable = DDLCExes.filter((fileName) =>
    fileName.endsWith(osName === "Windows" ? ".exe" : ".sh"),
  );

  if (executable.length === 0) {
    return {
      success: false,
      message: `No se encontró un archivo ejecutable compatible con el sistema operativo (${osName}) en la carpeta.`,
    };
  }

  if (osName === "Linux") {
    const linuxLauncher = DDLCExes.find((fileName) =>
      fileName.endsWith("auncher.sh"),
    );
    if (linuxLauncher) {
      return {
        success: true,
        data: linuxLauncher,
      };
    } else {
      const DDLCLinuxSh = DDLCExes.find((fileName) => fileName.endsWith(".sh"));
      if (DDLCLinuxSh) {
        return {
          success: true,
          data: DDLCLinuxSh,
        };
      }
    }
  }

  const WindowsExe = executable.find((fileName) => fileName.endsWith(".exe"));
  if (WindowsExe) {
    return {
      success: true,
      data: WindowsExe,
    };
  }
  return {
    success: false,
    message: `No se encontró un archivo ejecutable compatible con el sistema operativo (${osName}) en la carpeta.`,
  };
};

const createDirectory = async (name: string, prevDirectory: string) => {
  const directoryName = await window.api.files.joinPaths(prevDirectory, name);

  try {
    const checkResponse = await window.api.files.check(directoryName);

    if (!checkResponse.success) {
      return {
        success: false,
        message: `Error checking mod directory: ${checkResponse.message}`,
      };
    }

    if (checkResponse.data) {
      return {
        success: true,
        message: "Directory already exists",
        path: directoryName,
      };
    }

    const createResponse =
      await window.api.files.create.directory(directoryName);

    return {
      success: createResponse.success,
      message: createResponse.success
        ? "Directory created successfully"
        : `Error creating directory: ${createResponse.message}`,
      path: directoryName,
    };
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const copyDirectoryFiles = async (source: string, destination: string) => {
  try {
    const response = await window.api.files.copy.directory(source, destination);
    return response;
  } catch (error) {
    return {
      success: false,
      message: `Error copying directory: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const copyInternalDirectory = async (source: string, destination: string) => {
  try {
    const response = await window.api.files.copy.internal.directory(
      source,
      destination,
    );
    return response;
  } catch (error) {
    return {
      success: false,
      message: `Error copying internal files: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const unzipFileFile = async (zipPath: string, destination: string) => {
  try {
    const response = await window.api.files.unzip.file(zipPath, destination);
    return {
      ...response,
      path: destination,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error unzipping file: ${error instanceof Error ? error.message : String(error)}`,
      path: undefined,
    };
  }
};

const installModWithModeFolder = async (
  modName: string,
  baseDirectory: string,
  pathFileFolder: string,
  osName: SystemName,
) => {
  console.log("Base directory:", baseDirectory);
  let nameOfExecutable = "";
  if (osName === "MacOS") {
    const exeFilesResponse = await isExeFilesInDirectory(pathFileFolder);
    if (exeFilesResponse.success || exeFilesResponse.data) {
      return {
        success: false,
        message: `Se detectaron archivos ejecutables en la carpeta del mod, por favor asegúrate de que no haya ningún archivo ejecutable dentro de la carpeta del mod para continuar con la instalación.`,
      };
    }
  } else {
    const customExeResponse = await getCustomExecutableInList(
      pathFileFolder,
      osName,
    );

    if (!customExeResponse.success || !customExeResponse.data) {
      return {
        success: false,
        message: `Error checking for custom executable: ${customExeResponse.message}`,
      };
    }

    nameOfExecutable = customExeResponse.data;
  }
  /* Creacion de la carpeta del mod */
  const modFolder = await createDirectory(`mod_${modName}`, baseDirectory);

  if (!modFolder.success) {
    return {
      success: false,
      message: `Error creating mod directory: ${modFolder.message}`,
    };
  }
  if (!modFolder.path) {
    return {
      success: false,
      message: "Mod directory path is not available.",
    };
  }
  /* Creacion de la carpeta de DDLC dentro de la carpeta del mod */
  const DDLCFilesPath = `${osName === "MacOS" ? "ddlc-mac" : await window.api.files.joinPaths("ddlc-win-linux", "DDLC-1.1.1-pc")}`;

  const ddlcFolderDirectory = await createDirectory(
    DDLCFilesPath,
    modFolder.path,
  );

  if (!ddlcFolderDirectory.success) {
    return {
      success: false,
      message: `Error creating DDLC directory: ${ddlcFolderDirectory.message}`,
    };
  }

  if (!ddlcFolderDirectory.path) {
    return {
      success: false,
      message: "DDLC directory path is not available.",
    };
  }
  /* ruta de los archivos de DDLC dentro del proyecto */

  /* Copiado de los archivos de DDLC a la carpeta del mod */

  const copyDDLCResponse = await copyInternalDirectory(
    DDLCFilesPath,
    ddlcFolderDirectory.path,
  );
  if (!copyDDLCResponse.success) {
    return {
      success: false,
      message: `Error copying DDLC files: ${copyDDLCResponse.message}`,
    };
  }
  /* Copiado de los archivos del mod a la carpeta del mod */
  let pathToDestino = modFolder.path;
  if (osName === "MacOS") {
    pathToDestino = await window.api.files.joinPaths(
      pathToDestino,
      "ddlc-mac",
      "DDLC.app",
      "Contents",
      "Resources",
      "autorun",
    );
  } else {
    pathToDestino = await window.api.files.joinPaths(
      pathToDestino,
      "ddlc-win-linux",
      "DDLC-1.1.1-pc",
    );
  }

  const copyResponse = await copyDirectoryFiles(pathFileFolder, pathToDestino);
  if (!copyResponse.success) {
    return {
      success: false,
      message: `Error copying files: ${copyResponse.message}`,
    };
  }
  const finalPath =
    osName === "MacOS"
      ? await window.api.files.joinPaths(modFolder.path, "ddlc-mac", "DDLC.app")
      : await window.api.files.joinPaths(
          modFolder.path,
          "ddlc-win-linux",
          "DDLC-1.1.1-pc",
          nameOfExecutable,
        );
  return {
    success: true,
    message: "Mod installed successfully.",
    finalPath,
  };
};

export function useInstallation() {
  return {
    createDirectory,
    copyDirectoryFiles,
    unzipFileFile,
    installModWithModeFolder,
  };
}
