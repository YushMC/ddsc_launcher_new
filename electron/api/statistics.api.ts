import initializeDatabase from "../database/index.js";
import { prepareQuery, returnObjetToResponseApi } from "../utils/querys.js";

const AllStatisticsQuerys = {
  setSettingData:
    "INSERT INTO statistics (id_mod, id_user, total_played, last_played_at) VALUES (?, ?, ?, ?)",
  getDataSettingById: "SELECT * FROM statistics WHERE id = ?",
  updateSettingTotalPlayedById:
    "UPDATE statistics SET total_played = ? WHERE id = ?",
  updateSettingLastPlayedAtById:
    "UPDATE statistics SET last_played_at = ? WHERE id = ?",
};

const { db } = initializeDatabase();

const prepareQueryWraper = (query: string) => {
  if (!db) {
    throw new Error("No se pudo conectar a la base de datos");
  }

  return prepareQuery(query, db);
};

const allQuerysPrepare = {
  selectDataStatisticsByID: prepareQueryWraper(
    AllStatisticsQuerys.getDataSettingById,
  ),
  insertStatistics: prepareQueryWraper(AllStatisticsQuerys.setSettingData),
  updateStatisticsTotalPlayedByID: prepareQueryWraper(
    AllStatisticsQuerys.updateSettingTotalPlayedById,
  ),
  updateStatisticsLastPlayedAtByID: prepareQueryWraper(
    AllStatisticsQuerys.updateSettingLastPlayedAtById,
  ),
} as const;

const statisticsRepository = {
  getDataStatisticsById(id: number): ApiResponseDB<any> {
    try {
      const result = allQuerysPrepare.selectDataStatisticsByID.get({ id });

      return !result
        ? returnObjetToResponseApi(false, "Estadística no encontrada")
        : returnObjetToResponseApi(true, "Estadística encontrada", result);
    } catch (error) {
      return returnObjetToResponseApi(false, error);
    }
  },

  create(id_mod: number, id_user: number): ApiResponseDB<{ exist: boolean }> {
    try {
      allQuerysPrepare.insertStatistics.run({
        id_mod,
        id_user,
        total_played: 0,
        last_played_at: new Date().toISOString(),
      });
      return returnObjetToResponseApi(
        true,
        "Estadística agregada correctamente",
      );
    } catch (error: any) {
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        return {
          ...returnObjetToResponseApi(false, "La estadística ya existe"),
          data: { exist: true },
        };
      }
      return returnObjetToResponseApi(false, error);
    }
  },

  updateTotalPlayedById(id: number, total: string): ApiResponseDB {
    try {
      const result = allQuerysPrepare.updateStatisticsTotalPlayedByID.run({
        id,
        total_played: total,
      });

      return result.changes > 0
        ? returnObjetToResponseApi(true, "La actualización fue correcta")
        : returnObjetToResponseApi(
            false,
            "No se encontró la estadística para actualizar",
          );
    } catch (error: any) {
      return returnObjetToResponseApi(false, error);
    }
  },

  updateLastPlayedAtById(id: number, date: string): ApiResponseDB {
    try {
      const result = allQuerysPrepare.updateStatisticsLastPlayedAtByID.run({
        id,
        last_played_at: date,
      });

      return result.changes > 0
        ? returnObjetToResponseApi(
            true,
            "La fecha de última reproducción se actualizó correctamente",
          )
        : returnObjetToResponseApi(
            false,
            "No se encontró la estadística para actualizar",
          );
    } catch (error: any) {
      return returnObjetToResponseApi(false, error);
    }
  },
};

export default statisticsRepository;
