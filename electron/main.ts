import { app, BrowserWindow } from "electron";
import { Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { BDpc } from "./ipcs/index.js";
import initializeDatabase from "./database/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

function createWindow() {
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
  initializeDatabase();
  BDpc();
  createWindow();
  Menu.setApplicationMenu(null);
});
