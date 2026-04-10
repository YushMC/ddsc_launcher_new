import { getDatabase } from "../database/db.js";
import { prepareQuery, returnObjetToResponseApi } from "../utils/querys.js";
const AllUsersQuerys = {
    setUserData: "INSERT INTO users (username, is_developer, is_active) VALUES (@username, @is_developer, @is_active)",
    getAllUsers: "SELECT * FROM users WHERE is_active = 1 ORDER BY id DESC",
    getUserDataById: "SELECT * FROM users WHERE id = ?",
    updateUserUsernameById: "UPDATE users SET username = ? WHERE id = ?",
    updateUserDeveloperModeById: "UPDATE users SET is_developer = ? WHERE id = ?",
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
    selectDataUserByID: prepareQueryWraper(AllUsersQuerys.getUserDataById),
    selectData: prepareQueryWraper(AllUsersQuerys.getAllUsers),
    insertUser: prepareQueryWraper(AllUsersQuerys.setUserData),
    updateUsernameByID: prepareQueryWraper(AllUsersQuerys.updateUserUsernameById),
    updateDeveloperModeByID: prepareQueryWraper(AllUsersQuerys.updateUserDeveloperModeById),
});
const usersRepository = {
    getById(id) {
        try {
            const queries = getQuerysPrepare();
            const result = queries.selectDataUserByID.get({ id });
            return !result
                ? returnObjetToResponseApi(false, "Usuario no encontrado")
                : returnObjetToResponseApi(true, "Usuario encontrado", result);
        }
        catch (error) {
            console.error("Error in getById:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
    getAll() {
        try {
            const queries = getQuerysPrepare();
            const result = queries.selectData.all();
            return returnObjetToResponseApi(true, "Usuarios obtenidos", result);
        }
        catch (error) {
            console.error("Error in getAll:", error);
            return returnObjetToResponseApi(false, error);
        }
    },
    create(username) {
        try {
            const queries = getQuerysPrepare();
            queries.insertUser.run({
                username: username,
                is_developer: 0,
                is_active: 1,
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
            const result = queries.updateUsernameByID.run({
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
            const result = queries.updateDeveloperModeByID.run({
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
export default usersRepository;
