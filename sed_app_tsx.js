const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace mock log messages
code = code.replace(/useState<Array<{ timestamp: string; level: 'INFO' \| 'WARN' \| 'ERROR'; source: string; message: string }>>\(\[\s*\{[\s\S]*?\]\);/, "useState<Array<{ timestamp: string; level: 'INFO' | 'WARN' | 'ERROR'; source: string; message: string }>>([]);");

// Replace auto-simulation timer
code = code.replace(/\/\/ Auto-simulation timer to prove live state & client updates in "Desktop Dashboard"[\s\S]*?return \(\) => clearInterval\(timer\);\n  \}, \[\]\);/g, `  // Auto-simulation timer removed.`);

fs.writeFileSync('src/App.tsx', code);
