import initializeDatabase from "../database/index.js";
import { prepareQuery, returnObjetToResponseApi } from "../utils/querys.js";

const AllModsQuerys = {
  setModData:
    "INSERT INTO mods (name, logo, main_image, path) VALUES (?, ?, ?, ?)",
  getDataModById: "SELECT * FROM mods WHERE id = ?",
  getAllDataMods: "SELECT * FROM mods WHERE is_active = 1",
  updateModDataById:
    "UPDATE mods SET name = ?, logo = ?, main_image = ?, path = ?, is_custom = ? WHERE id = ?",
  deleteModById: "UPDATE mods SET is_active = 0 WHERE id = ?",
};

const { db } = initializeDatabase();

const prepareQueryWraper = (query: string) => {
  if (!db) {
    throw new Error("No se pudo conectar a la base de datos");
  }

  return prepareQuery(query, db);
};

const allQuerysPrepare = {
  selectDataModByID: prepareQueryWraper(AllModsQuerys.getDataModById),
  selectAllDataMods: prepareQueryWraper(AllModsQuerys.getAllDataMods),
  insertMod: prepareQueryWraper(AllModsQuerys.setModData),
  updateMod: prepareQueryWraper(AllModsQuerys.updateModDataById),
  deleteMod: prepareQueryWraper(AllModsQuerys.deleteModById),
} as const;

const modRepository = {
  getAllDataModById(id: number): ApiResponseDB<any> {
    try {
      const result = allQuerysPrepare.selectDataModByID.get({ id });

      return !result
        ? returnObjetToResponseApi(false, "Mod no encontrado")
        : returnObjetToResponseApi(true, "Mod encontrado", result);
    } catch (error) {
      return returnObjetToResponseApi(false, error);
    }
  },

  getAllDataMods(): ApiResponseDB<any> {
    try {
      const result = allQuerysPrepare.selectAllDataMods.all();

      return !result
        ? returnObjetToResponseApi(false, "Mods no encontrados")
        : returnObjetToResponseApi(true, "Mods encontrados", result);
    } catch (error) {
      return returnObjetToResponseApi(false, error);
    }
  },

  create(data: ModInterface): ApiResponseDB<{ exist: boolean }> {
    try {
      allQuerysPrepare.insertMod.run({
        name: data.name,
        logo: data.logo,
        main_image: data.main_image,
        path: data.path,
      });
      return returnObjetToResponseApi(true, "Mod agregado correctamente");
    } catch (error: any) {
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        return {
          ...returnObjetToResponseApi(false, "El mod ya existe"),
          data: { exist: true },
        };
      }
      return returnObjetToResponseApi(false, error);
    }
  },

  update(data: ModInterface): ApiResponseDB {
    try {
      const result = allQuerysPrepare.updateMod.run({
        name: data.name,
        logo: data.logo,
        main_image: data.main_image,
        path: data.path,
        is_custom: data.is_custom,
        id: data.id,
      });

      return result.changes > 0
        ? returnObjetToResponseApi(true, "La actualización fue correcta")
        : returnObjetToResponseApi(
            false,
            "No se encontró el registro para actualizar",
          );
    } catch (error: any) {
      return returnObjetToResponseApi(false, error);
    }
  },

  delete(id: number): ApiResponseDB {
    try {
      const result = allQuerysPrepare.deleteMod.run({ id });

      return result.changes > 0
        ? returnObjetToResponseApi(true, "El mod se eliminó correctamente")
        : returnObjetToResponseApi(
            false,
            "No se encontró el mod para eliminar",
          );
    } catch (error: any) {
      return returnObjetToResponseApi(false, error);
    }
  },
};

export default modRepository;
