import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serverProcess;
let serverUrl = null;

function startServer() {
  return new Promise((resolve, reject) => {
    const serverEntry = path.join(__dirname, "..", "server", "index.js");
    const dbPath = path.join(app.getPath("userData"), "crm.db");

    serverProcess = spawn(process.execPath, [serverEntry], {
      env: {
        ...process.env,
        CRM_DB_PATH: dbPath,
        ELECTRON_RUN_AS_NODE: "1",
      },
      stdio: ["inherit", "pipe", "inherit"],
    });

    serverProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(`[Server]: ${output}`);
      const match = output.match(/SERVER_PORT=(\d+)/);
      if (match) {
        serverUrl = `http://localhost:${match[1]}/api`;
        console.log(`✅ Backend URL detected: ${serverUrl}`);
        resolve(serverUrl);
      }
    });

    serverProcess.on("error", (err) => {
      console.error("Failed to start server process:", err);
      dialog.showErrorBox(
        "Ошибка запуска сервера",
        `Не удалось запустить порцесс бэкенда: ${err.message}`
      );
      reject(err);
    });

    serverProcess.on("exit", (code) => {
      if (code !== 0 && !serverUrl) {
        const msg = `Процесс сервера завершился с кодом ${code}`;
        console.error(msg);
        dialog.showErrorBox("Ошибка сервера", msg);
        reject(new Error(msg));
      }
    });
  });
}

ipcMain.handle("get-server-url", () => serverUrl);

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--api-url=${serverUrl}`],
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:8080";
  if (!app.isPackaged) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
  } catch (error) {
    console.error("Critical error during app startup:", error);
    // При желании можно завершить приложение при критической ошибке
    // app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
