const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn, exec } = require("child_process");
const path = require("path");
const http = require("http");
const fs = require("fs");
// TEST ONLY: turns off GPU acceleration. It must run before the app is ready.
// If the first-run crash disappears with this line, the cause is the graphics driver.
// app.disableHardwareAcceleration();

// ---------- State ----------
let mainWindow = null;
let setupWindow = null;
let splashWindow = null;
let backendProcess = null;
let logStream = null;
let isBackendStarting = false;
let backendReady = false;
let windowCreationInProgress = false;
let startupRunning = false;
let config = null;

// ---------- Constants ----------
const BACKEND_PORT = 8080; // port the backend listens on in server mode
const READY_RETRY_MS = 1000;
const READY_TIMEOUT_MS = 90000; // server mode: time allowed for the backend to boot
const CLIENT_TIMEOUT_MS = 15000; // client mode: time allowed to reach the server
const DEFAULT_CONFIG = { mode: "client", serverHost: "", serverPort: 8080 };
const HOST_REGEX = /^[A-Za-z0-9]([A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$/;

let backendUrl = `http://localhost:${BACKEND_PORT}`;
const healthUrl = () => `${backendUrl}/health`;

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

const isPackaged = app.isPackaged;
const isDev = !isPackaged;
const iconPath = isPackaged
  ? path.join(process.resourcesPath, "icons", "win", "icon.ico")
  : path.join(__dirname, "build", "icons", "win", "icon.ico");
const dllPath = isPackaged
  ? path.join(process.resourcesPath, "jsc_dll")
  : path.join(__dirname, "jsc_dll");
const logFilePath = path.join(app.getPath("userData"), "weighwiz.log");
const configPath = path.join(app.getPath("userData"), "weighwiz-config.json");

const javaBinary = process.platform === "win32" ? "java.exe" : "java";
const jarPath = isPackaged
  ? path.join(process.resourcesPath, "backend.jar")
  : path.join(__dirname, "server-java", "weighwiz-backend", "target", "weighwiz-server.jar");
const javaPath = isPackaged
  ? path.join(process.resourcesPath, "jre", "bin", javaBinary)
  : path.join(__dirname, "jre", "bin", javaBinary);

// ---------- Logging ----------
const log = (level, ...messages) => {
  const timestamp = new Date().toISOString();
  const msg = messages
    .map((message) => (typeof message === "object" ? JSON.stringify(message, null, 2) : message))
    .join(" ");
  const line = `[${timestamp}] [${level}] ${msg}\n`;

  if (isDev) {
    if (level === "ERROR" || level === "WARN") console.error(line.trim());
    else console.log(line.trim());
  }

  if (logStream) logStream.write(line);
};

const initializeLogging = () => {
  try {
    logStream = fs.createWriteStream(logFilePath, { flags: "a" });
    log("INFO", `App started - Log file: ${logFilePath}`);
  } catch (err) {
    console.error("Failed to open log file:", err);
  }
};

// ---------- Settings file (server or client mode, server address) ----------
const normalizeConfig = (incoming = {}) => ({
  mode: incoming.mode === "server" ? "server" : "client",
  serverHost: String(incoming.serverHost || "").trim(),
  serverPort: Number(incoming.serverPort) || 8080,
});

const validateConfig = (cfg) => {
  if (cfg.mode === "server") return null;
  if (!HOST_REGEX.test(cfg.serverHost)) {
    return "Enter the server's IP address or computer name, for example 192.168.1.50";
  }
  if (!Number.isInteger(cfg.serverPort) || cfg.serverPort < 1 || cfg.serverPort > 65535) {
    return "The port must be a number from 1 to 65535";
  }
  return null;
};

const loadConfig = () => {
  try {
    const cfg = normalizeConfig(JSON.parse(fs.readFileSync(configPath, "utf8")));
    return validateConfig(cfg) ? null : cfg;
  } catch {
    return null; // no file yet, or unreadable: ask the user
  }
};

const saveConfig = (cfg) => fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));

// ---------- Windows ----------
const closeSplash = () => {
  if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
  splashWindow = null;
};

const createSplash = () => {
  if (splashWindow && !splashWindow.isDestroyed()) return;

  splashWindow = new BrowserWindow({
    width: 600,
    height: 420,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    transparent: false,
    backgroundColor: "#ffffff",
    center: true,
    show: false,
  });

  splashWindow.loadFile(path.join(__dirname, "assets", "splash.html"));
  splashWindow.once("ready-to-show", () => splashWindow?.show());
};

const showSetup = (message = "") => {
  if (setupWindow && !setupWindow.isDestroyed()) {
    setupWindow.focus();
    return;
  }

  setupWindow = new BrowserWindow({
    width: 520,
    height: 560,
    resizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    title: "WeighWiz Setup",
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  setupWindow.loadFile(path.join(__dirname, "assets", "setup.html"), { query: { message } });
  setupWindow.on("closed", () => {
    setupWindow = null;
  });

  closeSplash(); // the setup window is open first, so the app never has zero windows
};

const showStartupError = (message) => {
  const html = `<body style="font-family:sans-serif;padding:2rem;background:#fff;color:#c00;"><h2>Startup Error</h2><p>${message}</p></body>`;
  const url = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;

  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.loadURL(url);
  else if (splashWindow && !splashWindow.isDestroyed()) splashWindow.loadURL(url);
};

const createWindow = () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return;
  }

  if (windowCreationInProgress) {
    log("INFO", "Main window creation already in progress; skipping duplicate create.");
    return;
  }

  windowCreationInProgress = true;

  mainWindow = new BrowserWindow({
    width: 1950,
    height: 1300,
    backgroundColor: "#ffffff",
    autoHideMenuBar: true,
    resizable: false,
    maximizable: false,
    fullscreen: false,
    show: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow
    .loadURL(`${backendUrl}/`)
    .then(() => log("INFO", "Frontend loaded successfully from", backendUrl))
    .catch((err) => {
      log("ERROR", "Frontend load failed:", err.message);
      closeSplash();
      const html = `<body style="font-family:sans-serif;padding:40px;background:#111;color:#f44;"><h1>Failed to load application</h1><p>The server may not be running or reachable.<br>Error: ${err.message}</p></body>`;
      mainWindow?.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    });

  mainWindow.once("ready-to-show", () => {
    closeSplash();
    mainWindow.show();
  });

  mainWindow.webContents.once("did-finish-load", () => {
    windowCreationInProgress = false;
  });

  mainWindow.webContents.once("did-fail-load", () => {
    windowCreationInProgress = false;
  });

  // Ctrl+Shift+S reopens the setup window (change the server address or mode)
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.control && input.shift && input.key.toLowerCase() === "s") {
      event.preventDefault();
      showSetup();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    windowCreationInProgress = false;
  });

  mainWindow.on("close", () => log("INFO", "Main window is closing"));

mainWindow.webContents.on("render-process-gone", (_event, details) => {
  log("ERROR", "Page process gone:", details.reason, "exit code", details.exitCode);
});

mainWindow.webContents.on("did-fail-load", (_event, code, description, url) => {
  log("ERROR", "Page load failed:", code, description, url);
});
};

// ---------- Talking to the backend ----------
const probeBackend = (timeoutMs = 2000) =>
  new Promise((resolve) => {
    try {
      const req = http.get(healthUrl(), (res) => {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });

      req.setTimeout(timeoutMs, () => req.destroy(new Error("Health check timeout")));
      req.on("error", () => resolve(false));
    } catch {
      resolve(false);
    }
  });

const waitForServer = async (timeoutMs, shouldAbort = () => false) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (shouldAbort()) return false;
    if (await probeBackend()) return true;
    await new Promise((resolve) => setTimeout(resolve, READY_RETRY_MS));
  }

  return false;
};

// ---------- Server mode: this PC runs the backend ----------
// Only a process LISTENING on the port is cleared. Browsers connected to the port are left alone.
const killStalePort = () =>
  new Promise((resolve) => {
    if (process.platform !== "win32") return resolve();

    exec("netstat -ano", (err, stdout) => {
      if (err || !stdout) return resolve();

      const pids = new Set();
      stdout.split(/\r?\n/).forEach((line) => {
        const parts = line.trim().split(/\s+/);
        // Columns: Proto, Local address, Foreign address, State, PID
        if (
          parts.length >= 5 &&
          parts[3] === "LISTENING" &&
          parts[1].endsWith(`:${BACKEND_PORT}`) &&
          parts[4] !== "0"
        ) {
          pids.add(parts[4]);
        }
      });

      if (pids.size === 0) return resolve();

      log("WARN", `Clearing stale process(es) listening on port ${BACKEND_PORT}:`, [...pids].join(", "));
      pids.forEach((pid) => exec(`taskkill /PID ${pid} /F`));
      setTimeout(resolve, 1000);
    });
  });

const startBackend = () => {
  if (backendReady || isBackendStarting) return true;

  log("INFO", "Starting backend with Java:", javaPath);
  log("INFO", "JAR path:", jarPath);

  if (!fs.existsSync(javaPath)) {
    log("ERROR", "Java runtime missing:", javaPath);
    showStartupError("Java runtime missing");
    return false;
  }

  if (!fs.existsSync(jarPath)) {
    log("ERROR", "Backend JAR missing:", jarPath);
    showStartupError("Backend JAR missing");
    return false;
  }

  log("INFO", "Using jSerialComm DLL path:", dllPath);
  isBackendStarting = true;

  const child = spawn(
    javaPath,
    ["--enable-native-access=ALL-UNNAMED", `-DjSerialComm.library.path=${dllPath}`, "-jar", jarPath],
    { env: { ...process.env } }
  );
  backendProcess = child;

  child.stdout.on("data", (data) => log("BACKEND", data.toString().trim()));
  child.stderr.on("data", (data) => log("BACKEND-ERROR", data.toString().trim()));

  child.on("error", (err) => {
    if (backendProcess === child) {
      backendProcess = null;
      isBackendStarting = false;
      backendReady = false;
    }
    log("ERROR", "Spawn failed:", err.message || err);
    showStartupError(`Failed to start backend<br>${err.message}`);
  });

  child.on("exit", (code, signal) => {
    if (backendProcess === child) {
      backendProcess = null;
      isBackendStarting = false;
      backendReady = false;
    }
    log("INFO", `Backend exited with code ${code} signal ${signal}`);

    if (!child.stoppedOnPurpose && code !== 0) showStartupError("Backend crashed");
  });

  return true;
};

const stopBackend = () => {
  if (!backendProcess) return;

  log("INFO", "Stopping backend process...");
  backendProcess.stoppedOnPurpose = true;
  const pid = backendProcess.pid;

  if (process.platform === "win32") exec(`taskkill /PID ${pid} /T /F`);
  else backendProcess.kill("SIGKILL");

  backendProcess = null;
  backendReady = false;
  isBackendStarting = false;
};

const startServer = async () => {
  if (await probeBackend()) {
    backendReady = true;
    log("INFO", `Detected running backend on ${healthUrl()}; reusing existing instance.`);
    createWindow();
    return;
  }

  await killStalePort();
  if (!startBackend()) return; // startBackend already showed the reason

  log("INFO", `Waiting for backend ${healthUrl()} ...`);
  const ready = await waitForServer(READY_TIMEOUT_MS, () => backendProcess === null);

  if (ready) {
    backendReady = true;
    isBackendStarting = false;
    log("INFO", "Backend ready");
    createWindow();
  } else if (backendProcess) {
    log("ERROR", "Backend readiness timeout");
    showStartupError("Backend failed to start (timeout)");
  }
};

// ---------- Client mode: another PC runs the backend ----------
const startClient = async () => {
  log("INFO", `Client mode: connecting to ${backendUrl}`);
  const reachable = await waitForServer(CLIENT_TIMEOUT_MS);

  if (!reachable) {
    log("ERROR", `Cannot reach the server at ${backendUrl}`);
    showSetup(
      `Cannot reach the WeighWiz server at ${backendUrl}. Check that the server is running and on the same network, then retry or correct the address.`
    );
    return;
  }

  createWindow();
};

// ---------- Startup and restart ----------
const beginStartup = async () => {
  if (startupRunning) return;
  startupRunning = true;

  try {
    config = loadConfig();

    if (!config) {
      showSetup(); // first run: ask which mode and which server
      return;
    }

    backendUrl =
      config.mode === "server"
        ? `http://localhost:${BACKEND_PORT}`
        : `http://${config.serverHost}:${config.serverPort}`;

    createSplash();

    if (config.mode === "server") await startServer();
    else await startClient();
  } finally {
    startupRunning = false;
  }
};

const restartApp = () => {
  createSplash(); // open before closing the others, so the app never has zero windows
  if (setupWindow && !setupWindow.isDestroyed()) setupWindow.close();
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
  stopBackend();
  windowCreationInProgress = false;
  beginStartup();
};

// ---------- Messages from the setup window ----------
const isFromSetupWindow = (event) =>
  !!setupWindow && !setupWindow.isDestroyed() && event.sender === setupWindow.webContents;

// Save done: start the app again from scratch so it takes the normal, proven start path
const relaunchApp = () => {
  stopBackend();
  app.relaunch();
  app.exit(0);
};

ipcMain.handle("config:get", (event) => {
  if (!isFromSetupWindow(event)) return DEFAULT_CONFIG;
  return loadConfig() || DEFAULT_CONFIG;
});

ipcMain.handle("config:save", (event, incoming) => {
  if (!isFromSetupWindow(event)) return { ok: false, error: "Not allowed" };

  const cleaned = normalizeConfig(incoming);
  const error = validateConfig(cleaned);
  if (error) return { ok: false, error };

  saveConfig(cleaned);
  setImmediate(relaunchApp); // let the reply reach the window first
  return { ok: true };
});

ipcMain.handle("app:retry", (event) => {
  if (!isFromSetupWindow(event)) return { ok: false };
  setImmediate(relaunchApp);
  return { ok: true };
});

// ---------- App events ----------
if (gotSingleInstanceLock) {
  app.whenReady().then(() => {
    initializeLogging();
    beginStartup();
  });
}

app.on("second-instance", () => {
  log("INFO", "Second app instance blocked; focusing existing window.");

  [setupWindow, splashWindow, mainWindow].forEach((win) => {
    if (win && !win.isDestroyed()) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
});

process.on("uncaughtException", (error) => {
  log("ERROR", "Uncaught exception in main process:", error.stack || error.message);
});

app.on("window-all-closed", () => {
  log("WARN", "All windows closed; quitting the app");
  stopBackend();
  if (process.platform !== "darwin") app.quit();
});

app.on("quit", () => {
  if (logStream) logStream.end();
});
