import path from "path";
import type { SystemName } from "~/types/systemData";

const createModDirectory = async (modName: string, baseDirectory: string) => {
  const directoryName = path.join(baseDirectory, `mod_${modName}`);

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
        message: "Mod directory already exists",
        path: directoryName,
      };
    }

    const createResponse =
      await window.api.files.create.directory(directoryName);

    return {
      success: createResponse.success,
      message: createResponse.success
        ? "Mod directory created successfully"
        : `Error creating mod directory: ${createResponse.message}`,
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
  const modFolder = await createModDirectory(modName, baseDirectory);
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
    pathToDestino = path.join(
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
  const modFolder = await createModDirectory(modName, baseDirectory);
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
  let pathToDestino = modFolder.path;
  if (osName === "MacOS") {
    pathToDestino = path.join(
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
    createModDirectory,
    copyDirectoryFiles,
    unzipFileFile,
    installModWithZipFile,
    installModWithModeFolder,
  };
}
