import initializeDatabase from "../database/index.js";
import { prepareQuery, returnObjetToResponseApi } from "../utils/querys.js";

const AllSettingsQuerys = {
  setSettingData: "INSERT INTO users (username) VALUES (?)",
  getDataSettingById: "SELECT * FROM users WHERE id = ?",
  updateSettingUsernameById: "UPDATE users SET username = ? WHERE id = ?",
  updateSettingDeveloperModeById:
    "UPDATE users SET is_developer = ? WHERE id = ?",
};

const { db } = initializeDatabase();

const prepareQueryWraper = (query: string) => {
  if (!db) {
    throw new Error("No se pudo conectar a la base de datos");
  }

  return prepareQuery(query, db);
};

const allQuerysPrepare = {
  selectDataSettingByID: prepareQueryWraper(
    AllSettingsQuerys.getDataSettingById,
  ),
  insertSetting: prepareQueryWraper(AllSettingsQuerys.setSettingData),
  updateSettingUsernameByID: prepareQueryWraper(
    AllSettingsQuerys.updateSettingUsernameById,
  ),
  updateSettingDeveloperModeByID: prepareQueryWraper(
    AllSettingsQuerys.updateSettingDeveloperModeById,
  ),
} as const;

const settingsRepository = {
  getDataSettingById(id: number): ApiResponseDB<any> {
    try {
      const result = allQuerysPrepare.selectDataSettingByID.get({ id });

      return !result
        ? returnObjetToResponseApi(false, "Usuario no encontrado")
        : returnObjetToResponseApi(true, "Usuario encontrado", result);
    } catch (error) {
      return returnObjetToResponseApi(false, error);
    }
  },

  create(data: SettingsInterface): ApiResponseDB<{ exist: boolean }> {
    try {
      allQuerysPrepare.insertSetting.run({
        username: data.username,
      });
      return returnObjetToResponseApi(true, "Usuario agregado correctamente");
    } catch (error: any) {
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        return {
          ...returnObjetToResponseApi(false, "El usuario ya existe"),
          data: { exist: true },
        };
      }
      return returnObjetToResponseApi(false, error);
    }
  },

  updateUsername(data: SettingsInterface): ApiResponseDB {
    try {
      const result = allQuerysPrepare.updateSettingUsernameByID.run({
        username: data.username,
        id: data.id,
      });

      return result.changes > 0
        ? returnObjetToResponseApi(true, "La actualización fue correcta")
        : returnObjetToResponseApi(
            false,
            "No se encontró el usuario para actualizar",
          );
    } catch (error: any) {
      return returnObjetToResponseApi(false, error);
    }
  },

  updateDeveloperMode(data: SettingsInterface): ApiResponseDB {
    try {
      const result = allQuerysPrepare.updateSettingDeveloperModeByID.run({
        developer_mode: data.developer_mode,
        id: data.id,
      });

      return result.changes > 0
        ? returnObjetToResponseApi(
            true,
            "El modo desarrollador se actualizó correctamente",
          )
        : returnObjetToResponseApi(
            false,
            "No se encontró el usuario para actualizar",
          );
    } catch (error: any) {
      return returnObjetToResponseApi(false, error);
    }
  },
};

export default settingsRepository;
