import Database from "better-sqlite3";
import fs from "fs";
import { app } from "electron";
import path from "path";
let dbInstance;
const installDb = () => {
    if (dbInstance)
        return dbInstance;
    const userDataPath = app.getPath("userData");
    if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
    }
    const dbPath = path.join(userDataPath, "app_ddsc_launcher.db");
    dbInstance = new Database(dbPath);
    return {
        path: userDataPath,
        db: dbInstance,
    };
};
const initializeDatabase = () => {
    try {
        const db = installDb();
        // Crear tablas al iniciar
        db.db.pragma("foreign_keys = ON");
        db.db.exec(`
  CREATE TABLE IF NOT EXISTS mods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    main_image TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    is_custom INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
  );

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  path_launcher TEXT NOT NULL DEFAULT '${db.path}',
  is_developer INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_mod INTEGER NOT NULL,
  id_user INTEGER NOT NULL,
  total_played TEXT NOT NULL,
  last_played_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_active INTEGER NOT NULL DEFAULT 1,

  FOREIGN KEY (id_mod) REFERENCES mods(id) ON DELETE CASCADE,
  FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_statistics_mod ON statistics(id_mod);
CREATE INDEX IF NOT EXISTS idx_statistics_user ON statistics(id_user);
CREATE INDEX IF NOT EXISTS idx_mods_id ON mods(id);
CREATE INDEX IF NOT EXISTS idx_mods_name ON mods(name);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
`);
        return {
            success: true,
            message: "Base de datos local inicializada y tablas creadas exitosamente",
            db: db.db,
        };
    }
    catch (error) {
        return {
            success: false,
            message: "Error al crear las tablas en la base de datos local.",
            db: null,
        };
    }
};
export default initializeDatabase;
