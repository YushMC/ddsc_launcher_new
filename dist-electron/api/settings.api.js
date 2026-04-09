import { getDatabase } from "../database/db.js";
import { prepareQuery, returnObjetToResponseApi } from "../utils/querys.js";
const AllSettingsQuerys = {
    setSettingData: "INSERT INTO users (username) VALUES (?)",
    getDataSettingById: "SELECT * FROM users WHERE id = ?",
    updateSettingUsernameById: "UPDATE users SET username = ? WHERE id = ?",
    updateSettingDeveloperModeById: "UPDATE users SET is_developer = ? WHERE id = ?",
};
const prepareQueryWraper = (query) => {
    const db = getDatabase();
    if (!db) {
        throw new Error("Base de datos no inicializada. Por favor, reinicia la aplicación.");
    }
    return prepareQuery(query, db);
};
// Preparar queries de forma lazy para evitar que se ejecuten antes de que la BD esté lista
const getQuerysPrepare = () => ({
    selectDataSettingByID: prepareQueryWraper(AllSettingsQuerys.getDataSettingById),
    insertSetting: prepareQueryWraper(AllSettingsQuerys.setSettingData),
    updateSettingUsernameByID: prepareQueryWraper(AllSettingsQuerys.updateSettingUsernameById),
    updateSettingDeveloperModeByID: prepareQueryWraper(AllSettingsQuerys.updateSettingDeveloperModeById),
});
const settingsRepository = {
    getDataSettingById(id) {
        try {
            const queries = getQuerysPrepare();
            const result = queries.selectDataSettingByID.get({ id });
            return !result
                ? returnObjetToResponseApi(false, "Usuario no encontrado")
                : returnObjetToResponseApi(true, "Usuario encontrado", result);
        }
        catch (error) {
            console.error("Error in getDataSettingById:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
    create(data) {
        try {
            const queries = getQuerysPrepare();
            queries.insertSetting.run({
                username: data.username,
            });
            return returnObjetToResponseApi(true, "Usuario agregado correctamente");
        }
        catch (error) {
            console.error("Error in create:", error);
            if (error instanceof Error && error.message.includes("UNIQUE")) {
                return {
                    ...returnObjetToResponseApi(false, "El usuario ya existe"),
                    data: { exist: true },
                };
            }
            return returnObjetToResponseApi(false, error);
        }
    },
    updateUsername(data) {
        try {
            const queries = getQuerysPrepare();
            const result = queries.updateSettingUsernameByID.run({
                username: data.username,
                id: data.id,
            });
            return result.changes > 0
                ? returnObjetToResponseApi(true, "La actualización fue correcta")
                : returnObjetToResponseApi(false, "No se encontró el usuario para actualizar");
        }
        catch (error) {
            console.error("Error in updateUsername:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
    updateDeveloperMode(data) {
        try {
            const queries = getQuerysPrepare();
            const result = queries.updateSettingDeveloperModeByID.run({
                developer_mode: data.developer_mode,
                id: data.id,
            });
            return result.changes > 0
                ? returnObjetToResponseApi(true, "El modo desarrollador se actualizó correctamente")
                : returnObjetToResponseApi(false, "No se encontró el usuario para actualizar");
        }
        catch (error) {
            console.error("Error in updateDeveloperMode:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
};
export default settingsRepository;
