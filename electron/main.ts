import pkg from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { BDpc, Filespc } from "./ipcs/index.js";
import { initializeDatabase, closeDatabase } from "./database/db.js";

const { app, BrowserWindow, Menu } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const isDev = !app.isPackaged;

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "icons", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  // Inicializar base de datos
  const dbInit = initializeDatabase();
  if (!dbInit.success) {
    console.error("Failed to initialize database:", dbInit.message);
  }

  // Registrar IPC handlers
  BDpc();
  Filespc();

  // Crear ventana
  createWindow();

  // Remover menu por defecto
  //Menu.setApplicationMenu(null);
});

// Cerrar conexión de BD al cerrar app
app.on("quit", () => {
  closeDatabase();
});
