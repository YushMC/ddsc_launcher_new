import { getDatabase } from "../database/db.js";
import { prepareQuery, returnObjetToResponseApi } from "../utils/querys.js";
const AllModsQuerys = {
    setModData: "INSERT INTO mods (name, logo, main_image, path) VALUES (?, ?, ?, ?)",
    getDataModById: "SELECT * FROM mods WHERE id = ?",
    getAllDataMods: "SELECT * FROM mods WHERE is_active = 1",
    updateModDataById: "UPDATE mods SET name = ?, logo = ?, main_image = ?, path = ?, is_custom = ? WHERE id = ?",
    deleteModById: "UPDATE mods SET is_active = 0 WHERE id = ?",
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
    selectDataModByID: prepareQueryWraper(AllModsQuerys.getDataModById),
    selectAllDataMods: prepareQueryWraper(AllModsQuerys.getAllDataMods),
    insertMod: prepareQueryWraper(AllModsQuerys.setModData),
    updateMod: prepareQueryWraper(AllModsQuerys.updateModDataById),
    deleteMod: prepareQueryWraper(AllModsQuerys.deleteModById),
});
const modRepository = {
    getAllDataModById(id) {
        try {
            const queries = getQuerysPrepare();
            const result = queries.selectDataModByID.get({ id });
            return !result
                ? returnObjetToResponseApi(false, "Mod no encontrado")
                : returnObjetToResponseApi(true, "Mod encontrado", result);
        }
        catch (error) {
            console.error("Error in getAllDataModById:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
    getAllDataMods() {
        try {
            const queries = getQuerysPrepare();
            const result = queries.selectAllDataMods.all();
            return !result
                ? returnObjetToResponseApi(false, "Mods no encontrados")
                : returnObjetToResponseApi(true, "Mods encontrados", result);
        }
        catch (error) {
            console.error("Error in getAllDataMods:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
    create(data) {
        try {
            const queries = getQuerysPrepare();
            queries.insertMod.run({
                name: data.name,
                logo: data.logo,
                main_image: data.main_image,
                path: data.path,
            });
            return returnObjetToResponseApi(true, "Mod agregado correctamente");
        }
        catch (error) {
            console.error("Error in create:", error);
            if (error instanceof Error && error.message.includes("UNIQUE")) {
                return {
                    ...returnObjetToResponseApi(false, "El mod ya existe"),
                    data: { exist: true },
                };
            }
            return returnObjetToResponseApi(false, error);
        }
    },
    update(data) {
        try {
            const queries = getQuerysPrepare();
            const result = queries.updateMod.run({
                name: data.name,
                logo: data.logo,
                main_image: data.main_image,
                path: data.path,
                is_custom: data.is_custom,
                id: data.id,
            });
            return result.changes > 0
                ? returnObjetToResponseApi(true, "La actualización fue correcta")
                : returnObjetToResponseApi(false, "No se encontró el registro para actualizar");
        }
        catch (error) {
            console.error("Error in update:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
    delete(id) {
        try {
            const queries = getQuerysPrepare();
            const result = queries.deleteMod.run({ id });
            return result.changes > 0
                ? returnObjetToResponseApi(true, "El mod se eliminó correctamente")
                : returnObjetToResponseApi(false, "No se encontró el mod para eliminar");
        }
        catch (error) {
            console.error("Error in delete:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
};
export default modRepository;
