const { contextBridge } = require("electron");

// Con contextIsolation:true, React no puede usar `require` ni tocar
// Node.js directamente (por seguridad). Lo que necesite tu UI del lado
// de Electron se expone acá, explícitamente, uno por uno.
//
// Hoy solo exponemos una bandera para poder detectar "estoy corriendo
// dentro de Electron" desde React (usada en App.jsx para elegir el
// modo de routing de wouter). A futuro, cosas como "guardar un adjunto
// directo a disco" o "elegir carpeta de exportación" también se
// exponen acá, nunca dándole a React acceso crudo a `fs`/`path`.
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,
});
