const { app, BrowserWindow } = require("electron");
const { spawn, exec } = require("child_process");
const path = require("path");
const http = require("http");
const fs = require("fs");

let mainWindow;
let backendProcess;
let logStream = null;
let splashWindow;
let isBackendStarting = false;
let backendReady = false;
let windowCreationInProgress = false;
let startupSequenceStarted = false;
let shutdownInProgress = false;

const BACKEND_HOST = "localhost";
const BACKEND_PORT = 8080;
const BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;
const HEALTH_URL = `${BACKEND_URL}/health`;
const READY_RETRY_MS = 1000;
const READY_TIMEOUT_MS = 90000;

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

let jarPath;
let javaPath;

if (isDev) {
  jarPath = path.join(
    __dirname,
    "server-java",
    "weighwiz-backend",
    "target",
    "weighwiz-server.jar"
  );
  javaPath = path.join(
    __dirname,
    "jre",
    "bin",
    process.platform === "win32" ? "java.exe" : "java"
  );
} else {
  jarPath = path.join(process.resourcesPath, "backend.jar");
  javaPath = path.join(
    process.resourcesPath,
    "jre",
    "bin",
    process.platform === "win32" ? "java.exe" : "java"
  );
}

function initializeLogging() {
  if (!isPackaged) {
    return;
  }

  try {
    logStream = fs.createWriteStream(logFilePath, { flags: "a" });
    log("INFO", `App started - Log file: ${logFilePath}`);
  } catch (err) {
    console.error("Failed to open log file:", err);
  }
}

function log(level, ...messages) {
  const timestamp = new Date().toISOString();
  const msg = messages
    .map((message) =>
      typeof message === "object" ? JSON.stringify(message, null, 2) : message
    )
    .join(" ");
  const line = `[${timestamp}] [${level}] ${msg}\n`;

  if (isDev) {
    if (level === "ERROR" || level === "WARN") {
      console.error(line.trim());
    } else {
      console.log(line.trim());
    }
  }

  if (logStream) {
    logStream.write(line);
  }
}

function createSplash() {
  if (splashWindow && !splashWindow.isDestroyed()) {
    return;
  }

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
  splashWindow.once("ready-to-show", () => {
    splashWindow.show();
  });
}

function showStartupError(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadURL(
      `data:text/html,<h1 style="color:red;padding:2rem;">${message}</h1>`
    );
  } else if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.loadURL(
      `data:text/html,<body style="font-family:sans-serif;padding:2rem;background:#fff;color:#c00;"><h2>Startup Error</h2><p>${message}</p></body>`
    );
  }
}

function probeBackend(timeoutMs = 2000) {
  return new Promise((resolve) => {
    const req = http.get(HEALTH_URL, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("Health check timeout"));
    });

    req.on("error", () => {
      resolve(false);
    });
  });
}

function killPort8080(callback) {
  if (process.platform !== "win32") {
    callback();
    return;
  }

  exec(`netstat -ano | findstr :${BACKEND_PORT}`, (err, stdout) => {
    if (err || !stdout) {
      callback();
      return;
    }

    const pids = new Set();

    stdout
      .trim()
      .split(/\r?\n/)
      .forEach((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid) {
          pids.add(pid);
        }
      });

    if (pids.size === 0) {
      callback();
      return;
    }

    log("WARN", `Clearing stale process(es) on port ${BACKEND_PORT}:`, [...pids].join(", "));

    pids.forEach((pid) => {
      exec(`taskkill /PID ${pid} /F`);
    });

    setTimeout(callback, 1000);
  });
}

function startBackend() {
  if (backendReady) {
    log("INFO", "Backend already ready; skipping spawn.");
    return;
  }

  if (isBackendStarting) {
    log("INFO", "Backend startup already in progress; skipping duplicate spawn.");
    return;
  }

  log("INFO", "Starting backend with Java:", javaPath);
  log("INFO", "JAR path:", jarPath);

  if (!fs.existsSync(javaPath)) {
    log("ERROR", "Java runtime missing:", javaPath);
    showStartupError("Java runtime missing");
    return;
  }

  if (!fs.existsSync(jarPath)) {
    log("ERROR", "Backend JAR missing:", jarPath);
    showStartupError("Backend JAR missing");
    return;
  }

  log("INFO", "Using jSerialComm DLL path:", dllPath);
  isBackendStarting = true;

  backendProcess = spawn(
    javaPath,
    [
      "--enable-native-access=ALL-UNNAMED",
      `-DjSerialComm.library.path=${dllPath}`,
      "-jar",
      jarPath,
    ],
    {
      env: {
        ...process.env,
      },
    }
  );

  backendProcess.stdout.on("data", (data) => {
    log("BACKEND", data.toString().trim());
  });

  backendProcess.stderr.on("data", (data) => {
    log("BACKEND-ERROR", data.toString().trim());
  });

  backendProcess.on("error", (err) => {
    isBackendStarting = false;
    backendReady = false;
    log("ERROR", "Spawn failed:", err.message || err);
    showStartupError(`Failed to start backend<br>${err.message}`);
  });

  backendProcess.on("exit", (code, signal) => {
    isBackendStarting = false;
    backendReady = false;
    backendProcess = null;
    log("INFO", `Backend exited with code ${code} signal ${signal}`);

    if (!shutdownInProgress && code !== 0) {
      showStartupError("Backend crashed");
    }
  });
}

function waitForBackend(callback) {
  const startedAt = Date.now();

  const check = () => {
    if (backendReady) {
      callback();
      return;
    }

    if (Date.now() - startedAt > READY_TIMEOUT_MS) {
      log("ERROR", "Backend readiness timeout");
      showStartupError("Backend failed to start (timeout)");
      return;
    }

    const req = http.get(HEALTH_URL, (res) => {
      res.resume();

      if (res.statusCode >= 200 && res.statusCode < 400) {
        backendReady = true;
        isBackendStarting = false;
        log("INFO", `Backend ready (status ${res.statusCode})`);
        callback();
        return;
      }

      log("DEBUG", `Backend status not OK: ${res.statusCode}`);
      setTimeout(check, READY_RETRY_MS);
    });

    req.setTimeout(2000, () => {
      req.destroy(new Error("Health check timeout"));
    });

    req.on("error", (err) => {
      log("DEBUG", `Health check pending: ${err.message}`);
      setTimeout(check, READY_RETRY_MS);
    });
  };

  log("INFO", `Waiting for backend ${HEALTH_URL} ...`);
  check();
}

function createWindow() {
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
    .loadURL(`${BACKEND_URL}/`)
    .then(() => {
      log("INFO", "Frontend loaded successfully");
    })
    .catch((err) => {
      log("ERROR", "Frontend load failed:", err.message);
      mainWindow.loadURL(
        `data:text/html,<body style="font-family:sans-serif;padding:40px;background:#111;color:#f44;"><h1>Failed to load application</h1><p>Backend may not be running or reachable.<br>Error: ${err.message}</p></body>`
      );
    });

  mainWindow.once("ready-to-show", () => {
    splashWindow?.close();
    mainWindow.show();
  });

  mainWindow.webContents.once("did-finish-load", () => {
    windowCreationInProgress = false;
  });

  mainWindow.webContents.once("did-fail-load", () => {
    windowCreationInProgress = false;
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    windowCreationInProgress = false;
  });
}

function startApp() {
  if (startupSequenceStarted) {
    log("INFO", "Startup sequence already running; ignoring duplicate start request.");
    return;
  }

  startupSequenceStarted = true;
  initializeLogging();
  createSplash();

  probeBackend().then((alreadyRunning) => {
    if (alreadyRunning) {
      backendReady = true;
      isBackendStarting = false;
      log("INFO", `Detected running backend on ${HEALTH_URL}; reusing existing instance.`);
      createWindow();
      return;
    }

    killPort8080(() => {
      startBackend();
      waitForBackend(createWindow);
    });
  });
}

app.whenReady().then(startApp);

app.on("second-instance", () => {
  log("INFO", "Second app instance blocked; focusing existing window.");

  if (splashWindow && !splashWindow.isDestroyed()) {
    if (splashWindow.isMinimized()) {
      splashWindow.restore();
    }
    splashWindow.focus();
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

app.on("window-all-closed", () => {
  shutdownInProgress = true;

  if (backendProcess) {
    log("INFO", "Stopping backend process...");

    if (process.platform === "win32") {
      exec(`taskkill /PID ${backendProcess.pid} /T /F`);
    } else {
      backendProcess.kill("SIGKILL");
    }
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    if (backendReady) {
      createWindow();
    } else {
      waitForBackend(createWindow);
    }
  }
});

app.on("quit", () => {
  if (logStream) {
    logStream.end();
  }
});
