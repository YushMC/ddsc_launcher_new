import type { SystemName } from "~/types/systemData";

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

const copyInternalFiles = async (source: string, destination: string) => {
  try {
    const response = await window.api.files.copy.internal(source, destination);
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

const installModWithZipFile = async (
  modName: string,
  baseDirectory: string,
  pathFileZip: string,
  osName: SystemName,
) => {
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
  const unzipResponse = await unzipFileFile(pathFileZip, modFolder.path);
  if (!unzipResponse.success) {
    return {
      success: false,
      message: `Error unzipping file: ${unzipResponse.message}`,
    };
  }
  if (!unzipResponse.path) {
    return {
      success: false,
      message: "Destination path after unzipping is not available.",
    };
  }

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
  }

  const copyResponse = await copyDirectoryFiles(
    unzipResponse.path,
    pathToDestino,
  );
  if (!copyResponse.success) {
    return {
      success: false,
      message: `Error copying files: ${copyResponse.message}`,
    };
  }

  return {
    success: true,
    message: "Mod installed successfully.",
  };
};

const installModWithModeFolder = async (
  modName: string,
  baseDirectory: string,
  pathFileFolder: string,
  osName: SystemName,
) => {
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
  const ddlcFolderDirectory = await createDirectory(
    osName === "MacOS" ? "ddlc-mac" : "ddlc-windows",
    modFolder.path,
  );

  if (!ddlcFolderDirectory.success || !ddlcFolderDirectory.path) {
    return {
      success: false,
      message: `Error creating DDLC directory: ${ddlcFolderDirectory.message}`,
    };
  }
  /* ruta de los archivos de DDLC dentro del proyecto */
  const DDLCFilesPath = await window.api.files.joinPaths(
    "",
    osName === "MacOS" ? "ddlc-mac" : "ddlc-windows",
  );

  /* Copiado de los archivos de DDLC a la carpeta del mod */

  const copyDDLCResponse = await copyInternalFiles(
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
  }

  const copyResponse = await copyDirectoryFiles(pathFileFolder, pathToDestino);
  if (!copyResponse.success) {
    return {
      success: false,
      message: `Error copying files: ${copyResponse.message}`,
    };
  }
  return {
    success: true,
    message: "Mod installed successfully.",
  };
};

export function useInstallation() {
  return {
    createDirectory,
    copyDirectoryFiles,
    unzipFileFile,
    installModWithZipFile,
    installModWithModeFolder,
  };
}
