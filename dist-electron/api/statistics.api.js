import { getDatabase } from "../database/db.js";
import { prepareQuery, returnObjetToResponseApi } from "../utils/querys.js";
const AllStatisticsQuerys = {
    setSettingData: "INSERT INTO statistics (id_mod, id_user, total_played, last_played_at) VALUES (@id_mod, @id_user, @total_played, @last_played_at)",
    getDataSettingById: "SELECT * FROM statistics WHERE id = ?",
    updateSettingTotalPlayedById: "UPDATE statistics SET total_played = @total_played WHERE id = @id",
    updateSettingLastPlayedAtById: "UPDATE statistics SET last_played_at = @last_played_at WHERE id = @id",
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
    selectDataStatisticsByID: prepareQueryWraper(AllStatisticsQuerys.getDataSettingById),
    insertStatistics: prepareQueryWraper(AllStatisticsQuerys.setSettingData),
    updateStatisticsTotalPlayedByID: prepareQueryWraper(AllStatisticsQuerys.updateSettingTotalPlayedById),
    updateStatisticsLastPlayedAtByID: prepareQueryWraper(AllStatisticsQuerys.updateSettingLastPlayedAtById),
});
const statisticsRepository = {
    getDataStatisticsById(id) {
        try {
            const queries = getQuerysPrepare();
            const result = queries.selectDataStatisticsByID.get({ id });
            return !result
                ? returnObjetToResponseApi(false, "Estadística no encontrada")
                : returnObjetToResponseApi(true, "Estadística encontrada", result);
        }
        catch (error) {
            console.error("Error in getDataStatisticsById:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
    create(id_mod, id_user) {
        try {
            const queries = getQuerysPrepare();
            queries.insertStatistics.run({
                id_mod,
                id_user,
                total_played: 0,
                last_played_at: new Date().toISOString(),
            });
            return returnObjetToResponseApi(true, "Estadística agregada correctamente");
        }
        catch (error) {
            console.error("Error in create:", error);
            if (error instanceof Error && error.message.includes("UNIQUE")) {
                return {
                    ...returnObjetToResponseApi(false, "La estadística ya existe"),
                    data: { exist: true },
                };
            }
            return returnObjetToResponseApi(false, error);
        }
    },
    updateTotalPlayedById(id, total) {
        try {
            const queries = getQuerysPrepare();
            const result = queries.updateStatisticsTotalPlayedByID.run({
                id,
                total_played: total,
            });
            return result.changes > 0
                ? returnObjetToResponseApi(true, "La actualización fue correcta")
                : returnObjetToResponseApi(false, "No se encontró la estadística para actualizar");
        }
        catch (error) {
            console.error("Error in updateTotalPlayedById:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
    updateLastPlayedAtById(id, date) {
        try {
            const queries = getQuerysPrepare();
            const result = queries.updateStatisticsLastPlayedAtByID.run({
                id,
                last_played_at: date,
            });
            return result.changes > 0
                ? returnObjetToResponseApi(true, "La fecha de última reproducción se actualizó correctamente")
                : returnObjetToResponseApi(false, "No se encontró la estadística para actualizar");
        }
        catch (error) {
            console.error("Error in updateLastPlayedAtById:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
};
export default statisticsRepository;
