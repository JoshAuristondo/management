const { app, BrowserWindow } = require("electron");
const path = require("node:path");

// app.isPackaged es false en desarrollo (npm run electron:dev) y true
// una vez que electron-builder empaquetó la app.
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    autoHideMenuBar: true,
    // Look consistente con tu tema oscuro mientras carga.
    backgroundColor: "#1f1f1f",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      // Nunca desactives esto: expone Node.js completo al renderer
      // (a tu UI de React), lo que es un riesgo serio si algún día
      // cargás contenido remoto o un adjunto malicioso.
      contextIsolation: true,
      nodeIntegration: false,
      
    },
  });

  if (isDev) {
    // Servido por `vite` (ver script electron:dev más abajo).
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    // Build de producción: dist/index.html vive un nivel arriba de
    // electron/ (ajustá si tu carpeta de build no es "dist").
    win.loadFile(path.join(__dirname, "../dist/index.html"));
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  // Comportamiento estándar en Mac: reabrir ventana al hacer click en
  // el ícono del dock si no hay ninguna abierta.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  // En Mac las apps suelen quedar "vivas" en el dock aunque se cierren
  // todas las ventanas; en Windows/Linux se cierra la app entera.
  if (process.platform !== "darwin") app.quit();
});
