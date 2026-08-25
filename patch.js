const fs = require('fs');
let code = fs.readFileSync('electron/main.ts', 'utf8');
code = code.replace(
  'mainWindow.focus();',
  'mainWindow.focus();\n      mainWindow.webContents.on("console-message", (event, level, message, line, sourceId) => {\n        console.log(`[DevTools Console] ${message}`);\n      });'
);
fs.writeFileSync('electron/main.ts', code);
