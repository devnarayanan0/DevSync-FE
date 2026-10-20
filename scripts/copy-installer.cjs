const fs = require('node:fs');
const path = require('node:path');

const [platform, filename] = process.argv.slice(2);
if (!platform || !filename || !['windows', 'macos'].includes(platform)) {
  throw new Error('Usage: node scripts/copy-installer.cjs <windows|macos> <filename>');
}

const source = path.resolve('dist-packaged', platform, filename);
const destination = path.resolve('releases', platform, filename);

if (!fs.existsSync(source)) {
  throw new Error(`Installer was not generated: ${source}`);
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
console.log(`Installer copied to ${destination}`);
