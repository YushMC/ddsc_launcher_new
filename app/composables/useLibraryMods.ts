import type { SystemName } from "~/types/systemData";
const {
  runFileMacOS,
  runFileWindows,
  checkFile,
  createDirectory,
  runFileLinux,
} = useFilesApiElectron();

const deleteMod = async (mod: ModDBInterface) => {
  try {
    const response = await window.api.mods.delete(mod.id);
    if (response.success) {
      const deleteFolder = await window.api.files.delete.directory(
        `user_data/${mod.name_folder}`,
      );
      if (!deleteFolder.success) {
        return {
          success: false,
          message: `El mod se eliminó, pero no se pudo eliminar la carpeta del mod: ${deleteFolder.message}`,
        };
      }

      return {
        success: true,
        message: "Mod eliminado exitosamente",
      };
    } else {
      return {
        success: false,
        message: String(response.message),
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Ocurrió un error inesperado al intentar eliminar el mod.",
    };
  }
};

const initializeUserDirectory = async () => {
  try {
    const userResponse = await window.api.users.get.byID(1);

    if (!userResponse.success || !userResponse.data) {
      return {
        success: false,
        message: userResponse.message || "No se pudo obtener datos del usuario",
      };
    }

    const dirExists = await checkFile(userResponse.data.folder_path);

    if (!dirExists.success || !dirExists.data) {
      const createResponse = await createDirectory(
        userResponse.data.folder_path,
      );

      if (!createResponse.success) {
        return {
          success: false,
          message: String(createResponse.message),
        };
      }
    }

    return {
      success: true,
      message: "Directorio de usuario inicializado correctamente",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al inicializar el directorio de usuario",
    };
  }
};

const runApp = async (mod: ModDBInterface, osName: SystemName) => {
  if (!osName) {
    return;
  }

  let response;

  switch (osName) {
    case "Windows":
      response = await runFileWindows(mod.path);
      break;
    case "MacOS":
      response = await runFileMacOS(mod.path);
      break;
    case "Linux":
      response = await runFileLinux(mod.path);
    default:
      return {
        success: true,
        message: "Ejecutando mod",
      };
  }

  return (
    response ?? {
      success: false,
      message: "Error al ejecutar el mod.",
    }
  );
};

const checkIFDDLCFolderExists = async (osName: SystemName) => {
  let response: ApiResponseDB<boolean>;
  const baseDirectory = await window.api.users.get.byID(1);
  if (!baseDirectory.success || !baseDirectory.data) {
    return {
      success: false,
      message: "No se pudo obtener el directorio base del usuario",
    };
  }
  switch (osName) {
    case "Windows":
      response = await window.api.files.check(
        await window.api.files.joinPaths(
          baseDirectory.data.folder_path,
          CONST_KEYS.DDLC_FOLDER.windows,
        ),
      );
      break;
    case "Linux":
      response = await window.api.files.check(
        await window.api.files.joinPaths(
          baseDirectory.data.folder_path,
          CONST_KEYS.DDLC_FOLDER.linux,
        ),
      );
      break;
    case "MacOS":
      response = await window.api.files.check(
        await window.api.files.joinPaths(
          baseDirectory.data.folder_path,
          CONST_KEYS.DDLC_FOLDER.macos,
        ),
      );
      console.log("Response checking DDLC folder on MacOS:", response);
      break;
    default:
      throw new Error("Sistema operativo no soportado");
  }
  return response;
};

export const useLibraryMods = () => {
  return {
    deleteMod,
    checkIFDDLCFolderExists,
    runApp,
    initializeUserDirectory,
  };
};
