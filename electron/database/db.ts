import Database from "better-sqlite3";
import fs from "fs";
import { app } from "electron";
import path from "path";

let dbInstance: Database.Database | null = null;
let dbPath: string = "";

/**
 * Inicializa la base de datos SQLite
 * Solo se ejecuta una vez. Las siguientes llamadas retornan la instancia existente
 */
export const initializeDatabase = (): {
  success: boolean;
  message: string;
  db: Database.Database | null;
  path: string;
} => {
  try {
    // Si ya existe instancia, retornarla
    if (dbInstance) {
      console.log("Database instance already exists, returning cached instance");
      return {
        success: true,
        message: "Database already initialized",
        db: dbInstance,
        path: dbPath,
      };
    }

    // Crear directorio si no existe
    const userDataPath = app.getPath("userData");
    console.log("User data path:", userDataPath);

    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
      console.log("Created user data directory");
    }

    // Crear instancia de BD
    dbPath = path.join(userDataPath, "app_ddsc_launcher.db");
    console.log("Database path:", dbPath);

    dbInstance = new Database(dbPath);
    console.log("Database instance created successfully");

    // Habilitar foreign keys
    dbInstance.pragma("foreign_keys = ON");
    console.log("Foreign keys pragma enabled");

    // Crear tablas
    dbInstance.exec(`
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
        path_launcher TEXT NOT NULL DEFAULT '${userDataPath}',
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

    console.log("Database tables created successfully");

    return {
      success: true,
      message: "Base de datos local inicializada y tablas creadas exitosamente",
      db: dbInstance,
      path: dbPath,
    };
  } catch (error) {
    console.error("Database initialization error:", error);
    return {
      success: false,
      message: `Error al crear las tablas en la base de datos local: ${error}`,
      db: null,
      path: "",
    };
  }
};

/**
 * Obtiene la instancia actual de la base de datos
 * Asegúrese de llamar primero a initializeDatabase()
 */
export const getDatabase = (): Database.Database | null => {
  if (!dbInstance) {
    console.warn(
      "Database instance not initialized. Call initializeDatabase() first."
    );
    return null;
  }
  return dbInstance;
};

/**
 * Cierra la conexión de la base de datos
 */
export const closeDatabase = (): void => {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log("Database connection closed");
  }
};

export default initializeDatabase;
